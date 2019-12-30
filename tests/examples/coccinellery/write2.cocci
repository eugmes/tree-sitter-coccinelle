//
//  delete double assignment
//
// Target: Linux, Generic
// Copyright:  2012 - LIP6/INRIA
// License:  Licensed under ISC. See LICENSE or http://www.isc.org/software/license
// Author: Julia Lawall <Julia.Lawall@lip6.fr>
// URL: http://coccinelle.lip6.fr/ 
// URL: http://coccinellery.org/ 

@@
expression e1,e2,e3;
@@

(
 (<+...e1++...+>)=e2;
|
 (<+...e1--...+>)=e2;
|
 (<+...++e1...+>)=e2;
|
 (<+...--e1...+>)=e2;
|
e1=e2;
e1 = <+...e1...+>;
|
*e1=e2;
*e1=e3;
)