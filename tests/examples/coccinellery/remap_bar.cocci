//
//  Reorder error handling code to include iounmap
//
// Target: Linux
// Copyright:  2012 - LIP6/INRIA
// License:  Licensed under ISC. See LICENSE or http://www.isc.org/software/license
// Author: Julia Lawall <Julia.Lawall@lip6.fr>
// URL: http://coccinelle.lip6.fr/ 
// URL: http://coccinellery.org/ 

@s exists@
position p1;
expression e1,e2;
@@

e1 = pci_ioremap_bar@p1(...);
... when != e1 = e2
iounmap(e1)

@r exists@
expression e1,e2;
position s.p1,p2;
statement S;
@@

e1 = pci_ioremap_bar@p1(...);
... when != e1 = e2
    when != iounmap(e1)
    when any
(
 if (<+...e1...+>) S
|
  if(...) { ... return 0; }
|
if (...) { ... when != iounmap(e1)
               when != if (...) { ... iounmap(e1) ... }
 return@p2 ...; } else S
)

@script:python@
p1 << s.p1;
p2 << r.p2;
@@

cocci.print_main("iomap",p1)
cocci.print_secs("iomap",p2)