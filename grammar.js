module.exports = grammar({
  name: 'coccinelle',

  word: $ => $.pure_ident,

  externals: $ => [
    /* Tree-sitter does not support lookahead for regexps, so code blocks
     * have to be implemented using an external scanner.
     */
    $._code_block,
  ],

  extras: $ => [
    /\s|\\\r?\n/,
    $.comment,
  ],

  conflicts: $ => [
    [$.all_basic_types_or_ident, $.non_signable_types],
    [$.non_signable_types, $.typedef_ctype]
  ],

  rules: {
    source_file: $ => seq(
      optional($.prolog),
      optional($.changesets)
    ),

    prolog: $ => repeat1($._incl),

    _incl: $ => choice(
      $.include,
      $.using,
      $.virtual
    ),

    include: $ => seq('#include', $.string),

    using: $ => seq(
      'using',
      choice($.string, $.pathIsoFile)
    ),

    virtual: $ => seq('virtual', comma_list($.pure_ident)),

    changesets: $ => repeat1(choice($.script, $.changeset)),

    changeset: $ => seq(
      $.metavariables,
      $.transformation
    ),

    script: $ => seq(
      $.script_metavariables,
      $.script_code
    ),

    metavariables: $ => seq(
      '@',
      optional($.pure_ident),
      optional($.extends),
      optional($.depends),
      optional($.choose_iso),
      optional($.disable_iso),
      optional($.exists),
      optional($.is_expression),
      '@',
      optional($.metadecs),
      '@@'
    ),

    script_metavariables: $ => choice(
      $._script_metavariables,
      $._initialize_metavariables,
      $._finalize_metavariables
    ),

    _script_metavariables: $ => seq(
      '@',
      'script',
      ':',
      $.pure_ident,
      optional($.pure_ident),
      optional($.depends),
      '@',
      optional($.script_metadecs),
      '@@'
    ),

    _initialize_metavariables: $ => seq(
      '@',
      'initialize',
      ':',
      $.pure_ident,
      optional($.depends),
      '@',
      optional($.script_virt_metadecs),
      '@@'
    ),

    _finalize_metavariables: $ => seq(
      '@',
      'finalize',
      ':',
      $.pure_ident,
      optional($.depends),
      '@',
      optional($.script_metadecs),
      '@@'
    ),

    extends: $ => seq(
      'extends',
      $.pure_ident
    ),

    scope: $ => choice('exists', 'forall'),

    depends: $ => seq(
      'depends', 'on',
      optional($.scope),
      $.dep,
    ),

    dep: $ => choice(
      $.pure_ident,
      $.dep_not,
      $.dep_cond,
      $.dep_bin_op,
      $.dep_file,
      seq('(', $.dep, ')')
    ),

    dep_not: $ => seq(
      '!',
      choice(
        $.pure_ident,
        seq('(', $.dep, ')')
      )
    ),

    dep_cond: $ => seq(
      choice('ever', 'never'),
      $.pure_ident
    ),

    dep_bin_op: $ => choice(
      prec.left(2, seq($.dep, '&&', $.dep)),
      prec.left(1, seq($.dep, '||',$.dep))
    ),

    dep_file: $ => seq('file', 'in', $.string),

    choose_iso: $ => seq('using', $.file_names),

    file_names: $ => comma_list($.string),

    disable_iso: $ => seq('disable', comma_list($.pure_ident)),

    exists: $ => choice('exists', 'forall'),

    is_expression: $ => choice('expression', 'identifier', 'type'),

    script_metadecs: $ => repeat1(seq($.script_meta, ';')),

    script_meta: $ => choice(
      seq($.pure_ident, optional($.script_name_decl_ext)),
      seq('(', $.pure_ident, ',', '_', ')', optional($.script_name_decl_ext)),
      seq('(', $.pure_ident, ',', $.pure_ident, ')', optional($.script_name_decl))
    ),

    script_name_decl: $ => seq('<<', $.checked_meta_name),

    checked_meta_name: $ => choice(
      seq(/* rule_name */$.pure_ident, '.', $.pure_ident),
      seq('virtual', '.', $.pure_ident),
      seq('merge', '.', $.pure_ident)
    ),

    script_name_decl_ext: $ => choice(
      $.script_name_decl,
      seq($.script_name_decl, '=', $.string),
      seq($.script_name_decl, '=', '[', ']')
    ),

    script_virt_metadecs: $ => repeat1(seq($.script_meta_virt_nofresh, ';')),

    script_meta_virt_nofresh: $ => seq($.pure_ident, $.script_virt_name_decl),

    script_virt_name_decl: $ => choice(
      seq('<<', 'virtual', '.', $.pure_ident),
      seq('<<', 'merge', '.', $.pure_ident)
    ),

    _initializer: $ => choice('initialiser', 'initializer'),

    metadec: $ => choice(
      /* metakind */
      seq('metavariable', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('parameter', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('parameter', 'list', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('expression', 'list', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq($._initializer, comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq($._initializer, 'list', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('statement', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('declaration', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('field', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('field', 'list', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('statement', 'list', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('identifier', 'list', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('function', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('local', 'function', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('declarer', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('iterator', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('type', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('error', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq(optional('local'), 'idexpression', optional($.meta_exp_type), comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq(optional('local'), 'idexpression', repeat1('*'), comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('global', 'idexpression', optional($.meta_exp_type), comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('global', 'idexpression', repeat1('*'), comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('constant', optional($.meta_exp_type), comma_list($.pure_ident_or_meta_ident_with_constraints)),

      /* metakind_bitfield */
      seq('expression', $.expression_type, optional($.bitfield), comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('expression', optional($.bitfield), comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq($.meta_exp_type, optional($.bitfield), comma_list($.pure_ident_or_meta_ident_with_constraints)),

      /* metakindnosym */
      seq('typedef', comma_list($.ident)),
      seq('attribute', 'name', comma_list($.ident)),
      seq('declarer', 'name', comma_list($.ident)),
      seq('iterator', 'name', comma_list($.ident)),

      /* metakind_fresh */
      seq('fresh', 'identifier', comma_list($.pure_ident_or_meta_ident_with_seed)),

      /* metakind_atomic_maybe_virt */
      seq('identifier', comma_list($.pure_ident_or_meta_ident_with_constraints_virt)),

      /* everything else */
      seq('position', optional('any'), comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('comments', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('parameter', 'list', '[', $.list_len, ']', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('expression', 'list', '[', $.list_len, ']', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('field', 'list', '[', $.list_len, ']', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq($._initializer, 'list', '[', $.list_len, ']', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('identifier', 'list', '[', $.list_len, ']', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('statement', 'list', '[', $.list_len, ']', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('symbol', comma_list($.pure_ident)),
      seq('format', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('format', 'list', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('format', 'list', '[', $.list_len, ']', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('binary', 'operator', comma_list($.pure_ident_or_meta_ident_with_constraints)),
      seq('assignment', 'operator', comma_list($.pure_ident_or_meta_ident_with_constraints))
    ),

    metadecs: $ => repeat1(seq($.metadec, ';')),

    list_len: $ => choice(
      $.pure_ident_or_meta_ident_with_constraints,
      $.list_len_pure
    ),

    list_len_pure: $ => choice(
      $.int,
      seq('virtual', '.', $.pure_ident)
    ),

    pure_ident_or_meta_ident_with_constraints_virt: $ => choice(
      $.pure_ident_or_meta_ident_with_constraints,
      seq('virtual', '.', $.pure_ident)
    ),

    pure_ident_or_meta_ident_with_seed: $ => choice(
      $.pure_ident_or_meta_ident,
      seq($.pure_ident_or_meta_ident, '=', $.seed_elem_list)
    ),

    seed_elem_list: $ => seq($.seed_elem, repeat(seq('##', $.seed_elem))),

    seed_elem: $ => choice(
      $.string,
      // TODO use an existing rule for those?
      $.pure_ident, /* TMetaId */
      seq('virtual', '.', $.pure_ident),
      seq(/* rule_name */ $.pure_ident, '.', $.pure_ident)
    ),

    pure_ident_or_meta_ident_with_constraints: $ => seq(
      $.pure_ident_or_meta_ident,
      optional($.constraints)
    ),

    pure_ident_or_meta_ident: $ => choice(
      $.pure_ident,
      alias($.pure_ident_kwd, $.pure_ident),
      $.meta_ident
      /* ,
      $.meta_ident_sym
      */
    ),

    meta_ident: $ => seq(
      $.pure_ident,
      '.',
      choice($.pure_ident, alias($.pure_ident_kwd, $.pure_ident)),
    ),

    pure_ident_kwd: $ => choice(
      'identifier',
      'expression',
      'statement',
      'function',
      'local',
      'type',
      'parameter',
      'idexpression',
      'initialiser',
      'list',
      'fresh',
      'constant',
      'error',
      'words',
      'pure',
      'context',
      'generated',
      'typedef',
      'declarer',
      'iterator',
      'name',
      'position',
      'symbol'
    ),

    constraints: $ => choice(
      seq('=~', $.string),
      seq('!~', $.string),
      seq('=', item_or_brace_list($.cstr_ident)),
      seq('!=', item_or_brace_list($.cstr_ident)),
      seq(choice('<=', '>=', '<', '>'), $.int),
      seq('<=', item_or_brace_list($.meta_ident)),
      seq(':', 'script', ':', /* language */ $.pure_ident, '(', optional(comma_list($.inherited_or_local_meta)), ')', '{', $.constraint_script_code, '}'),
      prec(3, seq('!', $.constraints)),
      prec.left(2, seq($.constraints, '&&', $.constraints)),
      prec.left(1, seq($.constraints, '||', $.constraints)),
      seq('(', $.constraints, ')')
    ),

    transformation: $ => $._code_block,

    script_code: $ => $._code_block,

    constraint_script_code: $ => /[^}]+/, // FIXME

    string: $ => /"[^"]*"/,

    int: $ => /[0-9]+/, // TODO other kinds of ints supported?

    pathIsoFile: $ => /<[^>]*>/,

    pure_ident: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    ctypes: $ => comma_list($.ctype),

    ctype: $ => choice(
      seq(optional($.const_vol), $.all_basic_types, repeat($.mul)),
      seq(optional($.const_vol), $.signed_or_unsigned),
      $.ctype_list
    ),

    mul: $ => seq('*', optional($.const_vol)), // TODO: check usages of this vs bare '*'

    ctype_list: $ => seq('(', $.ctype, repeat(seq('|', $.ctype)), ')'),

    const_vol: $ => choice('const', 'volatile'),

    all_basic_types: $ => choice(
      $.signed_basic_types,
      $.signable_types,
      $.non_signable_types
    ),

    all_basic_types_no_ident: $ => choice(
      $.signed_basic_types,
      $.signable_types_no_ident,
      $.non_signable_types
    ),

    signed_or_unsigned: $ => choice('signed', 'unsigned'),

    signed_basic_types: $ =>
      seq($.signed_or_unsigned, $.signable_types),

    signable_types: $ => choice(
      $.signable_types_no_ident,
      //TODO seq(/* rule_name */$.pure_ident, '.', $.pure_ident)
    ),

    non_signable_types: $ => choice(
      $.non_signable_types_no_ident,
      $.ident /* TODO TTypeId */
    ),

    non_signable_types_no_ident: $ => choice(
      'void',
      seq('long', 'double'),
      'double',
      'float',
      seq('long', 'double', 'complex'),
      seq('double', 'complex'),
      seq('float', 'complex'),
      'size_t',
      'ssize_t',
      'ptrdiff_t',
      seq('enum', $.ident),
      // TODO seq('enum', optional($.ident), '{', $.enum_decl_list, '}'),
      seq($.struct_or_union, $.ident),
      // TODO seq($.struct_or_union, optional($.type_ident), '{', $.struct_decl_list, '}'),
      // TODO seq($.ident /*TMetaType*/, '{', $.struct_decl_list, '}'),
      seq('decimal', '(', $.enum_val, ',', $.enum_val, ')'),
      seq('decimal', '(', $.enum_val, ')'),
      // TODO seq('typeof', '(', $.eexpr, ')'),
      seq('typeof', '(', $.ctype, ')')
    ),

    struct_or_union: $ => choice('struct', 'union'),

    enum_val: $ => choice(
      $.ident,
      $.int
    ),

    signable_types_no_ident: $ => choice(
      'char',
      'short',
      seq('short', 'int'),
      seq('int'),
      //$.ident, /* TODO TMetaType */
      'long',
      seq('long', 'int'),
      seq('long', 'long'),
      seq('long', 'long', 'int')
    ),

    meta_exp_type: $ => choice(
      $.typedef_ctype,
      seq($.typedef_ctype, '[', ']'),
      seq('{', comma_list($.ctype), '}', repeat('*'))
    ),

    typedef_ctype: $ => choice(
      seq(optional($.const_vol), $.all_basic_types, repeat('*')),
      seq('(', or_list($.ctype), ')'), // FIXME meta?
      $.ident
    ),

    cstr_ident: $ => choice(
      $.ctype_or_ident,
      $.int,
      seq($.int, '.', '.', '.', $.int),
      $.operator_constraint
    ),

    ctype_or_ident: $ => choice(
      seq(optional($.const_vol), $.all_basic_types_or_ident, repeat($.mul)),
      $.signed_or_unsigned
    ),

    all_basic_types_or_ident: $ => choice(
      $.all_basic_types_no_ident,
      $.ident
    ),

    ident: $ => choice(
      $.pure_ident,
      alias($.pure_ident_kwd, $.pure_ident),
      $.meta_ident
    ),

    operator_constraint: $ => choice(
      $.binary_operator,
      $.assignment_operator
    ),

    binary_operator: $ => choice(
      '<<', '*', '==', '!=', '+', '-', '/', '%', '<?', '>?',
      '>>', '&', '|', '^', '<', '>', '<=', '>=', '&&', '||'
    ),

    assignment_operator: $ => choice(
      '=', '-=', '+=', '*=', '/=',
      '%=', '&=', '|=', '^=',
      '>?=', '<?=', '<<=', '>>='
    ),

    expression_type: $ => choice(
      repeat1($.mul),
      seq(choice('enum', 'struct', 'union'), repeat($.mul)),
    ),

    inherited_or_local_meta: $ => choice(
      $.pure_ident, // FIXME
      seq(/* rule_name */ $.pure_ident, '.', $.pure_ident),
      seq(/* rule_name */ $.pure_ident, '.', alias($.pure_ident_kwd, $.pure_ident)),
    ),

    bitfield: $ => seq(':', $.delimited_list_len),

    delimited_list_len: $ => choice(
      $.pure_ident_or_meta_ident,
      seq('(', $.pure_ident_or_meta_ident_with_constraints, ')'),
      $.list_len_pure
    ),

    list_len_pure: $ => choice(
      $.int,
      seq('virtual', '.', $.pure_ident)
    ),

    ident: $ => choice($.pure_ident, $.meta_ident), // FIXME

    comment: $ => token(choice(
      seq('//', /[^\n]*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/'
      )))
    }
  }
);

function comma_list(rule) {
  return seq(rule, repeat(seq(',', rule)))
}

function item_or_brace_list(rule) {
  return choice(
    rule,
    seq('{', comma_list(rule), '}'),
  )
}

function or_list(rule) {
  return seq(rule, repeat(seq('||', rule)))
}
