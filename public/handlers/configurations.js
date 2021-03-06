/* eslint-disable no-use-before-define */
const log = require('electron-log');

const storage = require('../lib/storage');

/**
 * Get configurations.
 * @returns {array} configurations
 */
const getConfigurations = () => (
  new Promise(async (resolve, reject) => {
    try {
      const data = await storage.get('configurations');
      let configurations = [];
      if (data.length) {
        configurations = data;
      }
      configurations = configurations.filter(config => !!config.id);
      resolve(configurations);
    } catch (error) {
      log.error('getConfigurations', error);
      reject(error);
    }
  })
);

/**
 * Get enabled configurations.
 * @returns {array} enabledConfigurations
 */
const getEnabledConfigurations = () => (
  new Promise(async (resolve, reject) => {
    try {
      const promises = [
        (await getConfigurations()).filter(({ enabled }) => !!enabled),
        await getCurrentConnections(),
        await getSlackInstances(),
      ];

      Promise
        .all(promises)
        .then(([enabledConfigurations, currentConnections, slackInstances]) => {
          const connectedBssids = currentConnections.map(({ bssid }) => bssid.toUpperCase());
          const bssidConfigurations = enabledConfigurations.filter(({ bssid }) => bssid && connectedBssids.includes(bssid.toUpperCase()));

          const connectedSsids = currentConnections.map(({ ssid }) => ssid.toUpperCase());
          const ssidConfigurations = enabledConfigurations.filter(({ bssid, instanceId, ssid }) => {
            if (
              bssid
              && connectedBssids.includes(bssid.toUpperCase())
              && !bssidConfigurations.find(config => instanceId === config.instanceId && config.bssid.toUpperCase() === bssid.toUpperCase())
            ) {
              return true;
            } else if (
              !bssid
              && !bssidConfigurations.find(config => instanceId === config.instanceId && config.ssid.toUpperCase() === ssid.toUpperCase())
              && connectedSsids.includes(ssid.toUpperCase())
            ) {
              return true;
            }

            return false;
          });

          const updateConfigs = [
            ...bssidConfigurations,
            ...ssidConfigurations,
          ].map(config => ({
            ...config,
            token: (slackInstances.find(({ id }) => id === config.instanceId)).token,
          }));

          resolve(updateConfigs);
        })
        .catch(error => {
          reject(error);
        });
    } catch (error) {
      log.error('getEnabledConfigurations', error);
      reject(error);
    }
  })
);

/**
 * Save configurations.
 * @param {object} configuration - Configuration to save.
 * @returns {object} savedConfiguration
 */
const saveConfiguration = configuration => (
  new Promise(async (resolve, reject) => {
    try {
      resolve(await storage.set('configurations', [...(await getConfigurations()).filter(({ id }) => id !== configuration.id), configuration]));
    } catch (error) {
      log.error('saveConfiguration', error);
      reject(error);
    }
  })
);

/**
 * Remove configuration.
 * @param {object} configuration - Configuration to remove.
 * @returns {array} configurations
 */
const removeConfiguration = ({ id }) => (
  new Promise(async (resolve, reject) => {
    try {
      resolve(await storage.set('configurations', (await getConfigurations()).filter(configuration => configuration.id !== id)));
    } catch (error) {
      log.error('removeConfiguration', error);
      reject(error);
    }
  })
);

/**
 * Clear configurations and slackInstances
 */
const clearConfigurations = () => (
  new Promise(async (resolve, reject) => {
    try {
      const promises = [
        new Promise(async res => {
          try {
            res(storage.set('configurations', []));
          } catch (error) {
            reject(error);
            throw error;
          }
        }),
        new Promise(async res => {
          try {
            res(storage.set('slackInstances', []));
          } catch (error) {
            reject(error);
            throw error;
          }
        }),
      ];

      return Promise
        .all(promises)
        .then(() => {
          resolve();
        })
        .catch(error => {
          throw error;
        });
    } catch (error) {
      log.error('clearConfigurations', error);
      reject(error);
      return error;
    }
  })
);

module.exports = {
  getConfigurations,
  getEnabledConfigurations,
  saveConfiguration,
  removeConfiguration,
  clearConfigurations,
};

const { getCurrentConnections } = require('./connections');
const { getSlackInstances } = require('./slackInstances');
