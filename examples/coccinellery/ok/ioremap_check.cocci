//
//  Add missing iounmap
//
// Target: Linux
// Copyright:  2012 - LIP6/INRIA
// License:  Licensed under ISC. See LICENSE or http://www.isc.org/software/license
// Author: Julia Lawall <Julia.Lawall@lip6.fr>
// URL: http://coccinelle.lip6.fr/ 
// URL: http://coccinellery.org/ 

@@
type T,T1,T2;
identifier E;
statement S;
expression x1,x2;
constant C;
int ret;
@@

  T E;
  ...
* E = ioremap(...);
  if (E == NULL) S
  ... when != iounmap(E)
      when != if (E != NULL) { ... iounmap(E); ...}
      when != x1 = (T1)E
  if (...) {
    ... when != iounmap(E)
        when != if (E != NULL) { ... iounmap(E); ...}
        when != x2 = (T2)E
(
*   return;
|
*   return C;
|
*   return ret;
)
  }
