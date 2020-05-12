import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';
import Introduction from '../components/util/Introduction'

import themeFile from '../constants/theme'
import {Provider} from 'react-redux'
import store from '../redux/store'
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'

const theme = createMuiTheme(themeFile)

test('renders introduction', () => {
  const { getByText } = render(
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <header className="App-header">
          Splits by Spotify
        </header>
            <Introduction />
          </Provider>
        </MuiThemeProvider>);
  const linkElement = getByText('Welcome to Splits By Spotify!');
  expect(linkElement).toBeInTheDocument();
});

