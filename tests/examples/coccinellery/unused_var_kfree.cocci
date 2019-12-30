//
//  Remove unused variables and useless calls to kfree
//
// Target: Linux
// Copyright:  2012 - LIP6/INRIA
// License:  Licensed under ISC. See LICENSE or http://www.isc.org/software/license
// Author: Peter Senna Tschudin <peter.senna@gmail.com>
// URL: http://coccinelle.lip6.fr/ 
// URL: http://coccinellery.org/ 

@r1@
type T;
identifier i;
position p1, p2;
@@
(
T *i@p1 = NULL;
|
T *i@p1;
...
i = NULL;
)
... when != i
kfree(i)@p2;

@script:python r2@
p1 << r1.p1;
p2 << r1.p2;
@@
cocci.print_main("Declaration",p1)
cocci.print_sec("kfree()",p2)

