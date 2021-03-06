import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Layout, Table, Collapse, Slider, Tooltip, Switch } from 'antd';

import packageJson from '../../../../package.json';

import { Consumer } from '../../App/Context';
import Icon from '../../../component/Icon';

import ModifyConfiguration from '../../../component/ModifyConfiguration';

import { Styled } from '../Instance/Instance';
import { tableConfig, configurationsColumns } from '../Instance/InstanceConfig';

import { BORDER, COLOR, DIMENSION } from '../../../assets/css';

const { Header, Content } = Layout;
const { Panel } = Collapse;

const timerMarks = {
  30: '30s',
  300: '5m',
  600: '10m',
  900: '15m',
  1800: '30m',
  2700: '45m',
  3600: '1h',
};
const timerScanMarks = {
  30: '30s',
  60: '1m',
  120: '2m',
  180: '3m',
  240: '4m',
  300: '5m',
  360: '6m',
  420: '7m',
  480: '8m',
  540: '9m',
  600: '10m',
};

/**
 * Time formatter for the slider tooltip.
 * @param {number} value - Seconds to format.
 * @returns {string} formattedString
 */
const timerFormatter = value => {
  const time = moment.utc(value * 1000);

  const hours = time.format('H');
  const minutes = time.format('m');
  const seconds = time.format('s');

  const returnValue = [];
  if (hours !== '0') {
    returnValue.push(`${hours}h`);
  }
  if (minutes !== '0') {
    returnValue.push(`${minutes}m`);
  }
  if (seconds !== '0') {
    returnValue.push(`${seconds}s`);
  }

  return returnValue.join(' ');
};

/**
 * Configurations
 * @returns {jsx}
 */
const Configuration = () => (
  <Consumer>
    {({
      os, appConfigurations, configurations, slackInstances, currentSsids, updateAppConfigurations, saveConfiguration,
    }) => {
      const connectedBssids = currentSsids.map(({ bssid }) => bssid.toUpperCase());
      const bssidConfigurations = configurations.filter(({ bssid }) => bssid && connectedBssids.includes(bssid.toUpperCase()));

      const connectedSsids = currentSsids.map(({ ssid }) => ssid.toUpperCase());
      const ssidConfigurations = configurations.filter(({ bssid, instanceId, ssid }) => {
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

      const connectedConfigurations = [
        ...bssidConfigurations.map(({ id }) => id),
        ...ssidConfigurations.map(({ id }) => id),
      ];

      const dataSource = configurations
        .map(config => {
          const instance = slackInstances.find(({ id }) => id === config.instanceId) || {
            name: 'Unkown - deleted?',
          };
          return {
            key: config.id,
            slackInstanceName: instance.name,
            ssid: config.ssid,
            bssid: config.bssid,
            connected: connectedConfigurations.includes(config.id),
            instanceId: config.instanceId,
            config,
          };
        })
        .sort((a, b) => {
          if (a.slackInstanceName < b.slackInstanceName) {
            return -1;
          } else if (a.slackInstanceName > b.slackInstanceName) {
            return 1;
          } else if (a.slackInstanceName === b.slackInstanceName && a.ssid < b.ssid) {
            return -1;
          } else if (a.slackInstanceName === b.slackInstanceName && a.ssid > b.ssid) {
            return 1;
          } else if (a.slackInstanceName === b.slackInstanceName && a.ssid === b.ssid && a.bssid < b.bssid) {
            return -1;
          } else if (a.slackInstanceName === b.slackInstanceName && a.ssid === b.ssid && a.bssid > b.bssid) {
            return 1;
          }
          return 0;
        });


      const timerConfig = {
        marks: timerMarks,
        min: 30,
        max: 3600,
        step: 30,
        tipFormatter: timerFormatter,
      };

      /**
       * Update Application configurations.
       * @param {string} property - Property to update.
       * @param {array} keys - Keys to update with the value
       * @returns {function} value
       */
      const updateAppConfiguration = (property, keys) => value => {
        const newValues = keys.reduce((newConfig, key) => {
          if (key === 'allowDowngrade') {
            newConfig[key] = true;
          } else {
            newConfig[key] = value;
          }
          return newConfig;
        }, {

        });

        updateAppConfigurations(property, {
          ...appConfigurations,
          [property]: {
            ...appConfigurations[property],
            ...newValues,
          },
        });
      };

      if (!appConfigurations) {
        return null;
      }

      /* eslint-disable max-len */
      return (
        <Styled>
          <Header>
            Configurations
          </Header>
          <Content>
            <Collapse accordion defaultActiveKey="configurations">
              <Panel header="Slack instances" key="configurations">
                <Table
                  {...tableConfig}
                  columns={configurationsColumns(saveConfiguration, slackInstances)}
                  dataSource={dataSource}
                />
              </Panel>


              <Panel header="Timers" key="appConfigurations.timers">
                <ConfigurationSection>
                  <Tooltip placement="right" title="How often do you want your status to be updated in each Slack instance you have defined.">
                    <ConfigurationTitle>
                      Update status <Icon icon="info-circle" />
                    </ConfigurationTitle>
                  </Tooltip>
                  <Slider
                    {...timerConfig}
                    defaultValue={appConfigurations.timers.updateStatus}
                    onAfterChange={updateAppConfiguration('timers', ['updateStatus'])}
                  />
                </ConfigurationSection>

                <ConfigurationSection>
                  <Tooltip placement="right" title="How often do you want your WiFi connections to be scanned.">
                    <ConfigurationTitle>
                      Scan WiFi connections <Icon icon="info-circle" />
                    </ConfigurationTitle>
                  </Tooltip>
                  <Slider
                    {...timerConfig}
                    marks={timerScanMarks}
                    defaultValue={appConfigurations.timers.connections}
                    onAfterChange={updateAppConfiguration('timers', ['connections'])}
                    max={600}
                  />
                </ConfigurationSection>

                <ConfigurationSection>
                  <Tooltip placement="right" title={`How often do you want ${packageJson.productName} to fetch your Slack workspaces (custom emojis, your current status for each Slack instance, etc.).`}>
                    <ConfigurationTitle>
                      Update Slack workspaces <Icon icon="info-circle" />
                    </ConfigurationTitle>
                  </Tooltip>
                  <Slider
                    {...timerConfig}
                    defaultValue={appConfigurations.timers.slackInstances}
                    onAfterChange={updateAppConfiguration('timers', ['slackInstances'])}
                  />
                </ConfigurationSection>
              </Panel>


              <Panel header="Updates" key="appConfigurations.updates">
                <ConfigurationSection spacer>
                  <Tooltip placement="right" title={`Opt-in if you want ${packageJson.productName} to automatically check updates at launch.`}>
                    <ConfigurationTitle>
                      Check updates at launch <Icon icon="info-circle" />
                    </ConfigurationTitle>
                  </Tooltip>
                  <Switch
                    checked={appConfigurations.updates.checkUpdatesOnLaunch}
                    onChange={updateAppConfiguration('updates', ['checkUpdatesOnLaunch'])}
                  />
                </ConfigurationSection>

                {os === 'darwin' && (
                  <>
                    <ConfigurationSection spacer>
                      <Tooltip placement="right" title={`Opt-in if you want ${packageJson.productName} to automatically download new updates.`}>
                        <ConfigurationTitle>
                          Auto download updates <Icon icon="info-circle" />
                        </ConfigurationTitle>
                      </Tooltip>
                      <Switch
                        checked={appConfigurations.updates.autoDownload}
                        onChange={updateAppConfiguration('updates', ['autoDownload'])}
                      />
                    </ConfigurationSection>

                    <ConfigurationSection spacer>
                      <Tooltip placement="right" title={`Opt-in if you want ${packageJson.productName} to automatically install new (downloaded) updates on application quit.`}>
                        <ConfigurationTitle>
                          Install updates automatically on application quit <Icon icon="info-circle" />
                        </ConfigurationTitle>
                      </Tooltip>
                      <Switch
                        checked={appConfigurations.updates.autoInstallOnAppQuit}
                        onChange={updateAppConfiguration('updates', ['autoInstallOnAppQuit'])}
                      />
                    </ConfigurationSection>
                  </>
                )}

                <ConfigurationSection spacer>
                  <Tooltip placement="right" title="Opt-in if you want to get prereleases.">
                    <ConfigurationTitle>
                      Allow pre-releases <Icon icon="info-circle" />
                    </ConfigurationTitle>
                  </Tooltip>
                  <Switch
                    checked={appConfigurations.updates.allowPrerelease}
                    onChange={updateAppConfiguration('updates', ['allowPrerelease'])}
                  />
                </ConfigurationSection>

                <ConfigurationSection spacer>
                  <Tooltip placement="right" title="Opt-in if you want see full Change Log when there are new updates.">
                    <ConfigurationTitle>
                      Show full Change Log <Icon icon="info-circle" />
                    </ConfigurationTitle>
                  </Tooltip>
                  <Switch
                    checked={appConfigurations.updates.fullChangelog}
                    onChange={updateAppConfiguration('updates', ['fullChangelog'])}
                  />
                </ConfigurationSection>
              </Panel>


              <Panel header="Application" key="appConfigurations.app">
                <ConfigurationSection spacer>
                  <Tooltip placement="right" title={`Opt-in if you want ${packageJson.productName} to launch minimised.`}>
                    <ConfigurationTitle>
                      Launch application minimised <Icon icon="info-circle" />
                    </ConfigurationTitle>
                  </Tooltip>
                  <Switch
                    checked={appConfigurations.app.launchMinimised}
                    onChange={updateAppConfiguration('app', ['launchMinimised'])}
                  />
                </ConfigurationSection>

                <ConfigurationSection spacer>
                  <Tooltip placement="right" title={`Opt-in if you want ${packageJson.productName} to minimise instead of quit.`}>
                    <ConfigurationTitle>
                      Minimise application on quit <Icon icon="info-circle" />
                    </ConfigurationTitle>
                  </Tooltip>
                  <Switch
                    checked={appConfigurations.app.closeToTray}
                    onChange={updateAppConfiguration('app', ['closeToTray'])}
                  />
                </ConfigurationSection>
              </Panel>
            </Collapse>
            <ModifyConfiguration />
          </Content>
        </Styled>
      );
    }}
  </Consumer>
);

const ConfigurationTitle = styled.strong`
  &:hover {
    color: ${COLOR.red};
    cursor: help;
  }
`;

const ConfigurationSection = styled.div`
  padding: ${DIMENSION['0.5x']} 0;

  ${({ spacer }) => spacer && `
    display: flex;
    justify-content: space-between;
    border-bottom: ${BORDER.thin} solid ${COLOR.borderLight};
  `}

  &:last-child {
    border-bottom: none;
  }
`;

export default Configuration;
