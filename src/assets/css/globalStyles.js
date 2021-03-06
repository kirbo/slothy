import { createGlobalStyle } from 'styled-components';

import { COLOR } from './colors';
import { BORDER, DIMENSION } from './dimensions';
import { FONT_SIZE, FONT_WEIGHT } from './typography';

export const GlobalStyles = createGlobalStyle`
  html, body {
    width: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    font-size: ${FONT_SIZE.regular} !important;
  }

  #root {
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ant-notification-notice {
    & .ant-notification-notice-description {
      width: calc(100% - 48px);

      & .version {
        display: flex;
        justify-content: space-between;
        width: calc(100% - 30px);

        & .title {
          font-weight: ${FONT_WEIGHT.bold};
        }
        & .value {

        }
      }

      & .release {
        display: flex;
        flex-direction: column;
        width: calc(100% - 30px);
        margin-top: ${DIMENSION['0.5x']};

        & .title {
          font-weight: ${FONT_WEIGHT.bold};
          border-bottom: ${BORDER.thin} solid ${COLOR.borderLight};
        }
        & .value {
          max-height: calc(100vh - 20rem);
          max-width: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          word-break: break-word;

          & h2 {
            font-size: ${FONT_SIZE.m};
            font-weight: ${FONT_WEIGHT.thick};
            border-top: ${BORDER.thin} solid ${COLOR.borderLight};

            &:first-child {
              border: none;
            }
          }

          & h3 {
            font-size: ${FONT_SIZE.regular};
            font-weight: ${FONT_WEIGHT.bold};
          }
        }
      }

      & .ant-progress {
        width: calc(100% - ${DIMENSION['2.5x']});
      }
    }
    & .ant-notification-notice-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
  }

  .ant-table-thead > tr:last-child,
  .ant-table-tbody > tr:last-child {
    & > td {
      border-bottom: none;
    }
  }
`;
