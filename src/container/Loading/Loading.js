import React, { Component } from 'react';
import styled from 'styled-components';

import { GlobalStyles, FONT_SIZE } from '../../assets/css';
import { DIMENSION, COLORS } from '../../assets/css';

class Loading extends Component {
  state = {};

  componentDidMount = () => {
    setTimeout(() => {
      document.querySelector('.loading').classList.remove('hidden');
    }, 250);
  }

  static getDerivedStateFromProps = (props, state) => {
    if (props.slackInstancesLoaded) {
      document.querySelector('.loading').classList.add('loaded');
      setTimeout(() => {
        props.setProperty({ hideLoading: true });
      }, 400);
      setTimeout(() => {
        props.setProperty({ showLoading: false });
      }, 1000);
    }
    return state;
  }

  render = () => (
    <React.Fragment>
      <GlobalStyles />
      <Styled hideLoading={this.props.hideLoading}>
        <Layout>
          <div className="container">
            <div className="loading hidden">
              Loading, please standby...
            </div>
          </div>
        </Layout>
      </Styled>
    </React.Fragment>
  );
}

const Styled = styled.div`
  position: absolute;
  z-index: 100;
  font-size: ${FONT_SIZE['medium']};
  color: ${COLORS['black']};
  font-family: arial;
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  background: radial-gradient(#00142a, #000);
  transition: all 0.25s ease;
  opacity: ${({ hideLoading }) => hideLoading ? 0 : 1};
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
    color: ${COLORS['lightGray']};
    padding: ${DIMENSION['0.75x']};
    opacity: 1;
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