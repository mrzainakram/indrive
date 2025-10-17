import * as signalR from '@microsoft/signalr'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5001'

export class SignalRService {
  private rideConnection: signalR.HubConnection | null = null
  private locationConnection: signalR.HubConnection | null = null

  async connectToRideHub(token: string) {
    if (this.rideConnection?.state === signalR.HubConnectionState.Connected) {
      return this.rideConnection
    }

    this.rideConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${WS_URL}/hubs/ride`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build()

    try {
      await this.rideConnection.start()
      console.log('Connected to Ride Hub')
    } catch (err) {
      console.error('Error connecting to Ride Hub:', err)
    }

    return this.rideConnection
  }

  async connectToLocationHub(token: string) {
    if (this.locationConnection?.state === signalR.HubConnectionState.Connected) {
      return this.locationConnection
    }

    this.locationConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${WS_URL}/hubs/location`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build()

    try {
      await this.locationConnection.start()
      console.log('Connected to Location Hub')
    } catch (err) {
      console.error('Error connecting to Location Hub:', err)
    }

    return this.locationConnection
  }

  async joinRide(rideId: string) {
    if (this.rideConnection?.state === signalR.HubConnectionState.Connected) {
      await this.rideConnection.invoke('JoinRide', rideId)
    }
  }

  async leaveRide(rideId: string) {
    if (this.rideConnection?.state === signalR.HubConnectionState.Connected) {
      await this.rideConnection.invoke('LeaveRide', rideId)
    }
  }

  async updateLocation(latitude: number, longitude: number) {
    if (this.locationConnection?.state === signalR.HubConnectionState.Connected) {
      await this.locationConnection.invoke('UpdateLocation', latitude, longitude)
    }
  }

  onOfferReceived(callback: (offer: any) => void) {
    this.rideConnection?.on('OfferReceived', callback)
  }

  onOfferAccepted(callback: (ride: any) => void) {
    this.rideConnection?.on('OfferAccepted', callback)
  }

  onRideStatusUpdated(callback: (ride: any) => void) {
    this.rideConnection?.on('RideStatusUpdated', callback)
  }

  onLocationUpdated(callback: (location: any) => void) {
    this.locationConnection?.on('LocationUpdated', callback)
  }

  async disconnect() {
    if (this.rideConnection) {
      await this.rideConnection.stop()
      this.rideConnection = null
    }
    if (this.locationConnection) {
      await this.locationConnection.stop()
      this.locationConnection = null
    }
  }
}

export const signalRService = new SignalRService()

