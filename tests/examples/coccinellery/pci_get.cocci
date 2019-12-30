//
//  Drop unnecessary pci_dev_put
//
// Target: Linux
// Copyright:  2012 - LIP6/INRIA
// License:  Licensed under ISC. See LICENSE or http://www.isc.org/software/license
// Author: Julia Lawall <Julia.Lawall@lip6.fr>
// URL: http://coccinelle.lip6.fr/ 
// URL: http://coccinellery.org/ 

@@
expression dev;
expression E;
@@

* pci_dev_put(dev)
  ... when != dev = E
(
* pci_get_device(...,dev)
|
* pci_get_device_reverse(...,dev)
|
* pci_get_subsys(...,dev)
|
* pci_get_class(...,dev)
)

// the following rule doesn't find any real bugs
//@@
//expression from;
//expression E;
//@@
//
//* of_node_put(from);
//  ... when != from = E
//(
//* of_find_node_by_name(from,...)
//|
//* of_find_node_by_type(from,...)
//|
//* of_find_compatible_node(from,...)
//)
