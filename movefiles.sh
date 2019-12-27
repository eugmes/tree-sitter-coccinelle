#! /bin/sh

for dir in examples/{coccinellery,demos,tests}
do
  for file in $dir/todo/*.cocci
  do
    if tree-sitter parse -q $file
    then
      mv $file $dir/ok/
    fi
  done
done
