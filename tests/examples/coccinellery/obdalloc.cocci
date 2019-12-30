//
//  Not available\ncoccinellery-short = Not available\ncoccinellery-copyright = Copyright: 2012 - LIP6/INRIA\ncoccinellery-license = Licensed under GPLv2 or any later version.\ncoccinellery-author0 = Not available\n\nNot available\n
//
// Target: Not available\ncoccinellery-short = Not available\ncoccinellery-copyright = Copyright: 2012 - LIP6/INRIA\ncoccinellery-license = Licensed under GPLv2 or any later version.\ncoccinellery-author0 = Not available\n\nNot available\n
// Copyright:  Not available\ncoccinellery-short = Not available\ncoccinellery-copyright = Copyright: 2012 - LIP6/INRIA\ncoccinellery-license = Licensed under GPLv2 or any later version.\ncoccinellery-author0 = Not available\n\nNot available\n
// License:  Not available\ncoccinellery-short = Not available\ncoccinellery-copyright = Copyright: 2012 - LIP6/INRIA\ncoccinellery-license = Licensed under GPLv2 or any later version.\ncoccinellery-author0 = Not available\n\nNot available\n
// Author: Not available\ncoccinellery-short = Not available\ncoccinellery-copyright = Copyright: 2012 - LIP6/INRIA\ncoccinellery-license = Licensed under GPLv2 or any later version.\ncoccinellery-author0 = Not available\n\nNot available\n
// URL: http://coccinelle.lip6.fr/ 
// URL: http://coccinellery.org/ 

@@
expression ptr,e1,e2;
@@

- OBD_ALLOC(ptr,sizeof e1 * e2)
+ ptr = kcalloc(e2, sizeof e1, GFP_NOFS)

@@
expression ptr,e1,e2;
@@

- OBD_ALLOC_WAIT(ptr,sizeof e1 * e2)
+ ptr = kcalloc(sizeof e1, e2, GFP_KERNEL)

@@
expression ptr,e1,e2;
@@

- OBD_ALLOC(ptr,e2 * sizeof e1)
+ ptr = kcalloc(e2, sizeof e1, GFP_NOFS)

@@
expression ptr,e1,e2;
@@

- OBD_ALLOC_WAIT(ptr,e2 * sizeof e1)
+ ptr = kcalloc(e2, sizeof e1, GFP_KERNEL)

@@
expression ptr,e2;
type t;
@@

- OBD_ALLOC(ptr,sizeof (t) * e2)
+ ptr = kcalloc(e2, sizeof (t), GFP_NOFS)

@@
expression ptr,e2;
type t;
@@

- OBD_ALLOC_WAIT(ptr,sizeof (t) * e2)
+ ptr = kcalloc(e2, sizeof (t), GFP_KERNEL)

@@
expression ptr,e2;
type t;
@@

- OBD_ALLOC(ptr,e2 * sizeof (t))
+ ptr = kcalloc(e2, sizeof (t), GFP_NOFS)

@@
expression ptr,e2;
type t;
@@

- OBD_ALLOC_WAIT(ptr,e2 * sizeof (t))
+ ptr = kcalloc(e2, sizeof (t), GFP_KERNEL)

@@
expression ptr,e1,e2;
@@

- OBD_ALLOC(ptr,e1 * e2)
+ ptr = kcalloc(e1, e2, GFP_NOFS)

@@
expression ptr,e1,e2;
@@

- OBD_ALLOC_WAIT(ptr,e1 * e2)
+ ptr = kcalloc(e1, e2, GFP_KERNEL)

// -----------------------------------------------------------------------

@@
expression ptr,size;
@@

- OBD_ALLOC(ptr,size)
+ ptr = kzalloc(size, GFP_NOFS)

@@
expression ptr,size;
@@

- OBD_ALLOC_WAIT(ptr,size)
+ ptr = kzalloc(size, GFP_KERNEL)

@@
expression ptr;
@@

- OBD_ALLOC_PTR(ptr)
+ ptr = kzalloc(sizeof(*ptr), GFP_NOFS)

@@
expression ptr;
@@

- OBD_ALLOC_PTR_WAIT(ptr)
+ ptr = kzalloc(sizeof(*ptr), GFP_KERNEL)

// ----------------------------------------------------------------------

@@
expression ptr, size;
@@

- OBD_FREE(ptr, size);
+ kfree(ptr);

@@
expression ptr;
@@

- OBD_FREE_PTR(ptr);
+ kfree(ptr);
