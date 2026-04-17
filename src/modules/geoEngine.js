/**
 * Geo Engine — Browser Geolocation API with reverse geocoding
 */
import { logger, LOG_CATEGORIES } from '../utils/logger.js';

class GeoEngine {
  constructor() {
    this.location = null;
    this.error = null;
  }

  async capture() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        this.error = 'Geolocation not supported';
        logger.log(LOG_CATEGORIES.GEO, 'Geolocation not supported by browser');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          logger.log(LOG_CATEGORIES.GEO, `Position acquired: ${latitude}, ${longitude}`, {
            accuracy: `${accuracy}m`,
          });

          // Reverse geocode
          const address = await this._reverseGeocode(latitude, longitude);

          this.location = {
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            ...address,
            timestamp: new Date().toISOString(),
          };

          logger.log(LOG_CATEGORIES.GEO, `Location resolved: ${address.city}, ${address.state}`, this.location);
          resolve(this.location);
        },
        (error) => {
          this.error = error.message;
          logger.log(LOG_CATEGORIES.GEO, `Geolocation error: ${error.message}`);
          // Return a simulated location for demo purposes
          this.location = {
            latitude: 18.5204,
            longitude: 73.8567,
            accuracy: 25,
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            pincode: '411001',
            timestamp: new Date().toISOString(),
            simulated: true,
          };
          logger.log(LOG_CATEGORIES.GEO, 'Using simulated location for demo', this.location);
          resolve(this.location);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  async _reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      return {
        city: data.city || data.locality || 'Unknown',
        state: data.principalSubdivision || 'Unknown',
        country: data.countryName || 'India',
        pincode: data.postcode || 'N/A',
      };
    } catch (error) {
      logger.log(LOG_CATEGORIES.GEO, `Reverse geocoding failed: ${error.message}`);
      return {
        city: 'Unknown',
        state: 'Unknown',
        country: 'India',
        pincode: 'N/A',
      };
    }
  }

  getLocation() {
    return this.location;
  }

  getMapUrl() {
    if (!this.location) return null;
    const { latitude, longitude } = this.location;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=demo`;
  }

  getOSMMapUrl() {
    if (!this.location) return null;
    const { latitude, longitude } = this.location;
    // Use OpenStreetMap static image
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=14&size=600x300&markers=${latitude},${longitude},red-pushpin`;
  }
}

export const geoEngine = new GeoEngine();
