module.exports = grammar({
    name: 'coccinelle',

    word: $ => $.id,

    extras: $ => [
        /\s|\\\r?\n/,
        $.comment,
    ],

    rules: {
        source_file: $ => seq(
            field('header', optional($.header)),
            field('changesets', $.changesets)
        ),

        header: $ => repeat1($._include_cocci),

        _include_cocci: $ => choice(
            $.include,
            $.using,
            $.virtual
        ),

        include: $ => seq(
          '#include',
          field('file_name', $.string)
        ),

        using: $ => seq(
          'using',
          field('file_name', choice($.string, $.pathToIsoFile))
        ),

        virtual: $ => seq(
          'virtual',
          field('ids', $.id_list),
        ),

        changesets: $ => repeat1(choice($.script, $.changeset)),

        changeset: $ => seq(
          field('metavariables', $.metavariables),
          field('transformation', $.transformation)
        ),

        script: $ => seq(
          field('metavariables', $.script_metavariables),
          field('script_code', $.script_code)
        ),

        metavariables: $ => seq(
            '@',
            field('rule_name', optional($.id)),
            //field('extends', optional($.extends)),
            field('depends', optional($.depends)),
            field('using', optional($.iso)),
            field('disable', optional($.disable_iso)),
            field('exists', optional($.exists)),
            field('rule_kind', optional($.rule_kind)),
            '@',
            field('declarations', optional($.declarations)),
            '@@'
        ),

        declarations: $ => repeat1($._metadecl),

        script_metavariables: $ => choice(
          $._script_metavariables,
          $._virt_metavariables
        ),

        _script_metavariables: $ => seq(
          '@',
          field('kind', 'script'),
          ':', // Check if : is part of the token
          field('language', $.language),
          field('rule_name', optional($.id)),
          field('depends', optional($.depends)),
          '@',
          repeat($.script_metadecl),
          '@@'
        ),

        _virt_metavariables: $=> seq(
          '@',
          field('kind', choice('initialize', 'finalize')),
          ':',
          field('language', $.language),
          field('depends', optional($.depends)),
          '@',
          repeat($.script_virt_metadecl),
          '@@'
        ),

        language: $ => choice('python', 'ocaml'),

        script_metadecl: $ => seq(
          choice(
            seq(field('id', $.id), '<<', field('origin', $.mid)),
            seq('(', field('id', $.id), ',', field('syntax_id', $.id), ')', '<<', field('origin', $.mid)), // FIXME ocaml only
            // TODO add stuff with =, any examples?
            field('id', $.id)
          ),
          ';'
        ),

        script_virt_metadecl: $ => seq(
          field('id', $.id),
          '<<', 'virtual', '.',
          field('origin', $.id),
          ';'
        ),

        extends: $ => seq(
          'extends',
          field('name', $.id)
        ),

        scope: $ => choice('exists', 'forall'),

        depends: $ => seq(
            'depends', 'on',
            field('scope', optional($.scope)),
            field('dep', $.dep),
        ),

        dep: $ => choice(
            $.id,
            $.dep_not,
            $.dep_cond,
            $.dep_bin_op,
            $.dep_file,
            seq('(', $.dep, ')')
        ),

        dep_not: $ => seq(
            '!',
            choice(
                field('dep', $.id),
                seq('(', field('dep', $.dep), ')')
            )
        ),

        dep_cond: $ => seq(
          field('condition', choice('ever', 'never')),
          field('name', $.id)
        ),

        dep_bin_op: $ => choice(
            prec.left(2, seq(
              field('left', $.dep),
              field('operator', '&&'),
              field('right', $.dep))),
            prec.left(1, seq(
              field('left', $.dep),
              field('operator', '||'),
              field('right', $.dep)))
        ),

        dep_file: $ => seq(
          'file',
          'in',
          field('file_name', $.string)
        ),

        iso: $ => seq('using',
          field('file_names', commaSep1($.string))
        ),

        disable_iso: $ => seq(
          'disable',
          field('names', commaSep1($.id))
        ),

        exists: $ => choice('exists', 'forall'),

        rule_kind: $ => choice('expression', 'identifier', 'type'),

        _metadecl: $ => seq(choice(
            $.metavariable,
            $.fresh_identifier,
            $.parameter,
            $.parameter_list,
            $.identifier,
            $.identifier_list,
            $.type,
            $.statement,
            $.statement_list,
            $.declaration,
            $.field,
            $.field_list,
            $.initializer,
            $.initializer_list,
            $.typedef,
            $.attribute_name,
            $.declarer_name,
            $.declarer,
            $.iterator_name,
            $.iterator,
            $.idexpression,
            $.expression,
            $.expression_list,
            $.typed,
            $.constant,
            $.position,
            $.symbol,
            $.format,
            $.format_list,
            $.assignment_oerator,
            $.binary_operator
        ), ';'),

        metavariable: $ => seq('metavariable', $.ids),
        fresh_identifier: $ => seq('fresh', 'identifier', $.ids), // FIXME this one should allow expressions
        parameter: $ => seq('parameter', $.ids),
        parameter_list: $ => seq('parameter', 'list', optional($.array_decl), $.ids),
        identifier: $ => seq('identifier', commaSep1($._pmid_with_regexp_virt_or_not_eq)),
        identifier_list: $ => seq('identifier', 'list', optional($.array_decl), $.ids),
        type: $ => seq('type', $.ids),
        statement: $ => seq('statement', $.ids),
        statement_list: $ => seq('statement', 'list', $.ids),
        declaration: $ => seq('declaration', $.ids),
        field: $ => seq('field', $.ids),
        field_list: $ => seq('field', 'list', optional($.array_decl), $.ids), // FIXME array_decl is not in the official grammar
        initializer: $ => seq(choice('initializer', 'initialiser'), $.ids),
        initializer_list: $ => seq(choice('initializer', 'initialiser'), 'list', optional($.array_decl), $.ids), // FIXME array_decl is not in the official grammar
        typedef: $ => seq('typedef', $.ids),
        attribute_name: $ => seq('attribute', 'name', $.ids),
        declarer_name: $ => seq('declarer', 'name', $.ids),
        declarer: $ => seq('declarer', commaSep1($._pmid_with_regexp_or_not_eq)), // FIXME check if plain pmid is allowed
        iterator_name: $ => seq('iterator', 'name', $.ids),
        iterator: $ => seq('iterator', commaSep1($._pmid_with_regexp_or_not_eq)), // FIXME see above
        idexpression: $ => seq(optional($.locality), 'idexpression', optional($.type_decl), commaSep1($._pmid_with_opt_not_eq)),
        // FIXME expression allows other comparison operators...
        expression: $ => seq('expression', optional($._exp_type), commaSep1($._pmid_with_opt_not_ceq)), // FIXME constant only allowed when type is not used
        expression_list: $ => seq('expression', 'list', optional($.array_decl), $.ids),
        typed: $ => seq($.type_decl, optional(seq('[', ']')), commaSep1($._pmid_with_opt_not_ceq)),
        constant: $ => seq('constant', optional($.type_decl), commaSep1($._pmid_with_opt_not_eq)),
        position: $ => seq('position', optional('any'), commaSep1($._pmid_with_opt_not_eq)),
        symbol: $ => seq('symbol', $.ids),
        format: $ => seq('format', $.ids),
        format_list: $ => seq('format', 'list', $.array_decl, $.ids),
        assignment_oerator: $ => seq('assignment', 'operator', commaSep1($._assignopdecl)),
        binary_operator: $ => seq('binary', 'operator', commaSep1($._binopdecl)),

        _array_size_spec: $ => seq(
          '[',
          choice($.id, $._const),
          ']'),

        transformation: $ => /(\S@|[^@])*/,

        script_code: $ => /([^\n\r]@|[^@])*/,

        _const: $ => choice(
            $.string,
            $.integer,
            $.dots
        ),

        string: $ => /"[^"]*"/,

        regexp: $ => $.string, // FIXME

        integer: $ => /[0-9]+/,

        dots: $ => '...',

        pathToIsoFile: $ => /<[^>]*>/,

        id: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

        id_list: $ => commaSep1($.id),

        ids: $ => commaSep1($._pmid),

        _pmid: $ => choice($.id, $.mid),

        _id_or_cst: $ => choice($.id, $.integer),

        pmid_with_regexp: $ => seq(
          field('id', $._pmid),
          field('operator', choice('=~', '!~')),
          field('regexp', $.regexp)
        ),

        pmid_with_not_eq: $ => seq(
          field('id', $._pmid),
          '!=',
          field('value', choice(
            $._pmid,
            seq('{', commaSep1($._pmid), '}')
          ))
        ),

        _pmid_with_opt_not_eq: $ => choice($._pmid, $.pmid_with_not_eq),

        pmid_with_not_ceq: $ => seq(
          $._pmid,
          '!=',
          choice(
            $._id_or_cst,
            seq('{', commaSep1($._id_or_cst), '}')
          )
        ),

        _pmid_with_opt_not_ceq: $ => choice($._pmid, $.pmid_with_not_ceq),

        _pmid_with_regexp_virt_or_not_eq: $ => choice(
          $._pmid,
          $.pmid_with_regexp,
          $.pmid_with_not_eq
        ),

        _pmid_with_regexp_or_not_eq: $ => choice(
          $._pmid,
          $.pmid_with_regexp,
          $.pmid_with_virt,
          $.pmid_with_not_eq
        ),

        pmid_with_not_eq_mid: $ => seq(
          $._pmid,
          andAndList($.script_constraint) // FIXME
        ),

        // TODO rename?
        pmid_with_virt: $ => seq('virtual', '.', $.id),

        _exp_type: $ => choice(
          repeat1('*'),
          seq('enum', repeat('*')),
          seq('struct', repeat('*')),
          seq('union', repeat('*')),
        ),

        type_decl: $ => choice(
          $.ctype,
          seq('{', $.ctypes, '}', repeat('*'))
        ),

        locality: $ => choice('local', 'global'),

        array_decl: $ => seq(
          '[',
          choice($._pmid, $._const),
          ']'
        ),

        _assignopdecl: $ => seq($.id, optional(seq('=', $._assignop_constraint))),

        _assignop_constraint: $ => choice(
          $.assign_op,
          seq('{', commaSep1($.assign_op), '}')
        ),

        assign_op: $ => choice('=', '-=', '+=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>='),

        _binopdecl: $ => seq($.id, optional(seq('=', $._binop_constraint))),

        _binop_constraint: $ => choice(
          $.bin_op,
          seq('{', commaSep1($.bin_op), '}')
        ),

        script_constraint: $ => choice(
          seq('!=', $.mid),
          seq('!=', '{', commaSep1($.mid), '}')
          // TODO seq(':', 'script:', $.language, commaSep1($.mid), )
        ),

        bin_op: $ => choice(
          '*', '/', '%', '+', '-',
          '<<', '>>',
          'ˆ', '&', '|',
          '<', '>', '<=', '>=', '==', '!=',
          '&&', '||'
        ),

        ctypes: $ => commaSep1($.ctype),

        ctype: $ => choice(
            seq(optional($.const_vol), $.generic_ctype, repeat('*')),
            seq(optional($.const_vol), 'void', repeat1('*')),
            $.ctype_list
        ),

        ctype_list: $ => seq('(', $.ctype, repeat(seq('|', $.ctype)), ')'),

        const_vol: $ => choice('const', 'volatile'),

        generic_ctype: $ => choice(
          $.ctype_qualif,
          seq(optional($.ctype_qualif), 'char'),
          seq(optional($.ctype_qualif), 'short'),
          seq(optional($.ctype_qualif), 'short', 'int'),
          seq(optional($.ctype_qualif), 'int'),
          seq(optional($.ctype_qualif), 'long'),
          seq(optional($.ctype_qualif), 'long', 'int'),
          seq(optional($.ctype_qualif), 'long', 'long', 'int'),
          'double',
          seq('long', 'double'),
          'float',
          seq('long', 'double', 'complex'),
          seq('double', 'complex'),
          seq('float', 'complex'),
          'size_t',
          'ssize_t',
          'ptrdiff_t',
          // TODO seq('enum', $._pmid, '{', '}')
          $._pmid,
          seq(choice('struct', 'union'), $._pmid), // TODO struct_decl_list
          // TODO seq('typeof', '(', $.exp, ')'),
          seq('typeof', '(', $.ctype, ')')
        ),

        ctype_qualif: $ => choice('unsigned', 'signed'),

        mid: $ => seq($.id, '.', $.id),

        comment: $ => token(choice(
            seq('//', /[^\n]*/),
            seq(
                '/*',
                /[^*]*\*+([^/*][^*]*\*+)*/,
                '/'
            )))
    }
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)))
}

function andAndList(rule) {
  return seq(rule, repeat(seq('&&', rule)))
}
