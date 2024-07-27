using {sap.ui5.marketplace as my} from '../db/schema';


service marketplaceService@(path: '/marketplace') {
  entity Products as projection on my.Products
}
