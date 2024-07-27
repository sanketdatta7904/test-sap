namespace sap.ui5.marketplace;
using { managed } from '@sap/cds/common';

entity Products : managed {
  key ID         : UUID;
  Name      : String(100);
  Description       : String(1000);
  Owner          : String(120);
}
