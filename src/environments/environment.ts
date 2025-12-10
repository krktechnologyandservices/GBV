/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:7119/api',
  apiProcessUrl: 'https://localhost:7224/api',
  apiReportUrl: 'https://localhost:7051/api',
};
// export const environment = {
//   production: false,
//   apiBaseUrl: 'https://midipay.runasp.net/api',
//   apiProcessUrl: 'https://midipayprocess.runasp.net/api',
//   apiReportUrl: 'https://midipayreport.runasp.net/api',
// };
