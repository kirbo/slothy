import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { COLOR, DIMENSION, GlobalStyles, FONT_SIZE } from '../../assets/css';

import Logo from '../../component/Logo';

/**
 * Loading
 */
class Loading extends Component {
  state = {

  };

  /**
   * ComponentDidMount
   */
  componentDidMount = () => {
    setTimeout(() => {
      document.querySelector('.loading').classList.remove('hidden');
    }, 250);
  }

  /**
   * ComponentWillReceiveProps
   * @param {object} props - Properties for the component.
   * @param {object} state - State of the component.
   * @returns {object} state
   */
  componentWillReceiveProps = ({ slackInstancesLoaded, configurationsLoaded, appConfigurationsLoaded, setProperty }, state) => {
    if (slackInstancesLoaded && configurationsLoaded && appConfigurationsLoaded) {
      document.querySelector('.loading').classList.add('loaded');
      setTimeout(() => {
        setProperty({
          hideLoading: true,
        });
      }, 400);
      setTimeout(() => {
        setProperty({
          showLoading: false,
        });
      }, 1500);
    }
    return state;
  }

  /**
   * Duh.
   */
  render = () => {
    const { hideLoading } = this.props;
    return (
      <>
        <GlobalStyles />
        <Styled hideLoading={hideLoading}>
          <Layout>
            <div className="container">
              <Logo withText />
              <div className="loading hidden">
                Loading, please standby...
              </div>
            </div>
          </Layout>
        </Styled>
      </>
    );
  }
}

Loading.defaultProps = {
  appConfigurationsLoaded: false,
};

Loading.propTypes = {
  slackInstancesLoaded: PropTypes.bool.isRequired,
  configurationsLoaded: PropTypes.bool.isRequired,
  appConfigurationsLoaded: PropTypes.bool,
  hideLoading: PropTypes.bool.isRequired,
  setProperty: PropTypes.func.isRequired,
};

const Styled = styled.div`
  position: absolute;
  z-index: 1000;
  font-size: ${FONT_SIZE.m};
  color: ${COLOR.black};
  font-family: arial;
  display: flex;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  background: radial-gradient(${COLOR.darkBlue}, ${COLOR.black});
  transition: all 0.5s ease;
  z-index: 10000;
  opacity: ${({ hideLoading }) => (hideLoading ? 0 : 1)};

  & div.logo {
    height: ${DIMENSION['10x']};
    min-height: ${DIMENSION['10x']};
    max-height: ${DIMENSION['10x']};
    width: 20rem;
    min-width: 20rem;
    max-width: 20rem;
    display: flex;
    align-items: center;
    justify-content: center;

    & svg.logo-text {
      fill: ${COLOR.white};
    }
  }
`;

const Layout = styled.div`
  display: flex;
  flex: 1;

  & .container {
    position: relative;
    width: 100%;
    justify-content: center;
    display: flex;
  }

  & .loading {
    color: ${COLOR.lightGray};
    opacity: 1;
    height: ${DIMENSION['1.5x']};
    top: calc(50% - ${DIMENSION['1.5x']}/2 + ${DIMENSION['4x']});
    transition: all 0.25s ease;
    position: absolute;
    margin-left: 0;

    &.hidden {
      opacity: 0;
      margin-left: -10rem;
    }

    &.loaded {
      opacity: 0;
      margin-left: 10rem;
    }
  }
`;

export default Loading;
