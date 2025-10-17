from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
import os
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connection
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'postgres'),
            database=os.getenv('DB_NAME', 'indrive_db'),
            user=os.getenv('DB_USER', 'indrive'),
            password=os.getenv('DB_PASSWORD', 'indrive_pass_2024'),
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None

# AI Model for fare prediction
class FarePredictionModel:
    def __init__(self):
        self.model = LinearRegression()
        self.poly_features = PolynomialFeatures(degree=2)
        self.is_trained = False
        self.base_fare = 2.5
        self.per_km_rate = 1.5
        self.surge_multiplier = 1.0

    def train(self, distances, fares):
        """Train the model with historical data"""
        if len(distances) < 10:
            logger.warning("Not enough data to train model. Using fallback pricing.")
            return False
        
        try:
            X = np.array(distances).reshape(-1, 1)
            y = np.array(fares)
            
            # Add polynomial features for better prediction
            X_poly = self.poly_features.fit_transform(X)
            
            self.model.fit(X_poly, y)
            self.is_trained = True
            logger.info(f"Model trained successfully with {len(distances)} samples")
            return True
        except Exception as e:
            logger.error(f"Model training error: {e}")
            return False

    def predict(self, distance_km):
        """Predict fare for a given distance"""
        try:
            if self.is_trained and distance_km > 0:
                X = np.array([[distance_km]])
                X_poly = self.poly_features.transform(X)
                base_prediction = self.model.predict(X_poly)[0]
                
                # Apply surge multiplier and add variance
                min_fare = base_prediction * 0.85 * self.surge_multiplier
                max_fare = base_prediction * 1.15 * self.surge_multiplier
                avg_fare = base_prediction * self.surge_multiplier
                
                # Ensure minimum fare
                min_fare = max(min_fare, 2.0)
                
                return {
                    'min_fare': round(float(min_fare), 2),
                    'max_fare': round(float(max_fare), 2),
                    'average_fare': round(float(avg_fare), 2),
                    'model': 'ml_trained'
                }
            else:
                # Fallback calculation
                estimated_fare = self.base_fare + (distance_km * self.per_km_rate)
                return {
                    'min_fare': round(estimated_fare * 0.8, 2),
                    'max_fare': round(estimated_fare * 1.2, 2),
                    'average_fare': round(estimated_fare, 2),
                    'model': 'fallback'
                }
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            estimated_fare = self.base_fare + (distance_km * self.per_km_rate)
            return {
                'min_fare': round(estimated_fare * 0.8, 2),
                'max_fare': round(estimated_fare * 1.2, 2),
                'average_fare': round(estimated_fare, 2),
                'model': 'error_fallback'
            }

    def update_surge(self, multiplier):
        """Update surge pricing multiplier based on demand"""
        self.surge_multiplier = max(1.0, min(multiplier, 3.0))

# Initialize model
fare_model = FarePredictionModel()

def load_and_train_model():
    """Load historical data and train the model"""
    try:
        conn = get_db_connection()
        if conn is None:
            logger.warning("Could not connect to database for training")
            return
        
        cursor = conn.cursor()
        
        # Get completed rides with distance and fare data
        cursor.execute("""
            SELECT distance_km, final_fare 
            FROM rides 
            WHERE status = 'completed' 
            AND distance_km IS NOT NULL 
            AND final_fare IS NOT NULL
            AND distance_km > 0
            ORDER BY completed_at DESC
            LIMIT 1000
        """)
        
        rides = cursor.fetchall()
        
        if rides and len(rides) >= 10:
            distances = [float(ride['distance_km']) for ride in rides]
            fares = [float(ride['final_fare']) for ride in rides]
            
            fare_model.train(distances, fares)
            logger.info(f"Model trained with {len(rides)} historical rides")
        else:
            logger.info(f"Not enough completed rides ({len(rides) if rides else 0}). Using fallback pricing.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        logger.error(f"Error loading training data: {e}")

# Train model on startup
load_and_train_model()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'InDrive AI Fare Service',
        'model_trained': fare_model.is_trained
    }), 200

@app.route('/api/fare/predict', methods=['POST'])
def predict_fare():
    """Predict fare for a given distance"""
    try:
        data = request.get_json()
        
        if not data or 'distance_km' not in data:
            return jsonify({'error': 'distance_km is required'}), 400
        
        distance_km = float(data['distance_km'])
        
        if distance_km <= 0:
            return jsonify({'error': 'distance_km must be positive'}), 400
        
        prediction = fare_model.predict(distance_km)
        
        return jsonify({
            'minFare': prediction['min_fare'],
            'maxFare': prediction['max_fare'],
            'averageFare': prediction['average_fare'],
            'message': f"Fare suggestion based on {prediction['model']} model"
        }), 200
    
    except ValueError:
        return jsonify({'error': 'Invalid distance_km value'}), 400
    except Exception as e:
        logger.error(f"Prediction endpoint error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/fare/retrain', methods=['POST'])
def retrain_model():
    """Retrain the model with latest data"""
    try:
        load_and_train_model()
        return jsonify({
            'message': 'Model retrained successfully',
            'is_trained': fare_model.is_trained
        }), 200
    except Exception as e:
        logger.error(f"Retrain endpoint error: {e}")
        return jsonify({'error': 'Failed to retrain model'}), 500

@app.route('/api/fare/surge', methods=['POST'])
def update_surge():
    """Update surge pricing multiplier"""
    try:
        data = request.get_json()
        
        if not data or 'multiplier' not in data:
            return jsonify({'error': 'multiplier is required'}), 400
        
        multiplier = float(data['multiplier'])
        fare_model.update_surge(multiplier)
        
        return jsonify({
            'message': 'Surge multiplier updated',
            'multiplier': fare_model.surge_multiplier
        }), 200
    
    except ValueError:
        return jsonify({'error': 'Invalid multiplier value'}), 400
    except Exception as e:
        logger.error(f"Surge endpoint error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/fare/stats', methods=['GET'])
def get_fare_stats():
    """Get fare statistics"""
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                COUNT(*) as total_rides,
                AVG(final_fare) as avg_fare,
                MIN(final_fare) as min_fare,
                MAX(final_fare) as max_fare,
                AVG(distance_km) as avg_distance
            FROM rides 
            WHERE status = 'completed'
            AND final_fare IS NOT NULL
        """)
        
        stats = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'total_rides': int(stats['total_rides']) if stats['total_rides'] else 0,
            'avg_fare': round(float(stats['avg_fare']), 2) if stats['avg_fare'] else 0,
            'min_fare': round(float(stats['min_fare']), 2) if stats['min_fare'] else 0,
            'max_fare': round(float(stats['max_fare']), 2) if stats['max_fare'] else 0,
            'avg_distance': round(float(stats['avg_distance']), 2) if stats['avg_distance'] else 0,
            'model_trained': fare_model.is_trained
        }), 200
    
    except Exception as e:
        logger.error(f"Stats endpoint error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

