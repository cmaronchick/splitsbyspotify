export const getUrlParameters = (redirectUrl, sParam) => {
  const sURLQueryString = redirectUrl.split('?');
  const sURLVariables = sURLQueryString[1].split('&')
  for (var i = 0; i < sURLVariables.length; i++) {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] === sParam) {
          if (sParameterName[1].indexOf("#") > -1) {
              var code = sParameterName[1].split('#');
              console.log('code', code)
              return code[0];
          }
          return sParameterName[1];
      }
  }
}


export const generateRandomString = function(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};