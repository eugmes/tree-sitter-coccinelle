module.exports = grammar({
    name: 'coccinelle',

    word: $ => $.id,

    extras: $ => [
        /\s|\\\r?\n/,
        $.comment,
    ],

    rules: {
        source_file: $ => seq(
            optional($.header),
            repeat1($.changeset)
        ),

        header: $ => repeat1($._include_cocci),

        _include_cocci: $ => choice(
            $.include,
            $.using_file,
            $.using_iso,
            $.virtual
        ),

        include: $ => seq('#include', $.string),

        using_file: $ => seq('using', $.string),

        using_iso: $ => seq('using', $.pathToIsoFile),

        virtual: $ => seq('virtual', $._ids),

        changeset: $ => choice(
          seq($.metavariables, $.transformation),
          seq($.script_metavariables, $.script_code)
        ),

        metavariables: $ => seq(
            '@', optional($.rulename), '@',
            repeat($._metadecl),
            '@@'
        ),

        script_metavariables: $ => choice(
          $._script_metavariables,
          $._finalize_metavariables,
          $._initialize_metavariables,
        ),

        _script_metavariables: $=> seq(
          '@', 'script:', $.language, optional($.rulename), // FIXME grammar has 'depends on' part, but it is also in rulename...
          '@',
          repeat($.script_metadecl),
          '@@'
        ),

        _finalize_metavariables: $=> seq(
          '@', 'finalize:', $.language, optional($.depends), '@',
          repeat($.script_virt_metadecl),
          '@@'
        ),

        _initialize_metavariables: $=> seq(
          '@', 'initialize:', $.language, optional($.depends), '@',
          repeat($.script_virt_metadecl),
          '@@'
        ),

        language: $ => choice('python', 'ocaml'),

        script_metadecl: $ => seq(
          choice(
            seq($.id, '<<', $.id, '.', $.id),
            seq('(', $.id, ',', $.id, ')', '<<', $.id, '.', $.id), // ocaml only
            // TODO add stuff with =, any examples?
            $.id
          ),
          ';'
        ),

        script_virt_metadecl: $ => seq($.id, '<<', 'virtual', '.', $.id, ';'),

        rulename: $ => seq(
            $.id,
            optional($.extends),
            optional($.depends),
            optional($.iso),
            optional($.disable_iso),
            optional($.exists),
            optional($.rulekind)
        ),

        extends: $ => seq('extends', $.id),

        scope: $ => choice('exists', 'forall'),

        depends: $ => seq(
            optional(seq('depends', 'on')),
            optional($.scope),
            $.dep
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
                $.id,
                seq('(', $.dep, ')')
            )
        ),

        dep_cond: $ => choice(
            seq('ever', $.id),
            seq('never', $.id),
        ),

        dep_bin_op: $ => choice(
            prec.left(2, seq($.dep, '&&', $.dep)),
            prec.left(1, seq($.dep, '||', $.dep))
        ),

        dep_file: $ => seq('file', 'in', $.string),

        iso: $ => seq('using', $.string, commaSep1($.string)),

        disable_iso: $ => seq('disable', $._ids),

        exists: $ => choice('exists', 'forall'),

        rulekind: $ => choice('expression', 'identifier', 'type'),

        _metadecl: $ => seq(choice(
            $.simple_metadecl,
            $.parameter_list_id,
            $.parameter_list_const,
            $.identifier_list_id,
            $.identifier_list_const
            // TODO add the rest
        ), ';'),

        simple_metadecl: $ => seq($._metadecl_kind, $._ids),

        _metadecl_kind: $ => choice(
            seq('fresh', 'identifier'),
            seq('parameter', optional('list')),
            seq('identifier', optional('list')),
            'type',
            seq('statement', optional('list')),
            'declaration',
            seq('field', optional('list')),
            seq('initializer', optional('list')),
            seq('initialiser', optional('list')),
            'typedef',
            seq('attribute', 'name'),
            seq('declarer', 'name'),
            seq('iterator', 'name'),
            seq('expression', 'list'),
            'symbol',
            'format'
        ),

        parameter_list_id: $ => seq('parameter', 'list', '[', $.id, ']', $._ids),
        parameter_list_const: $ => seq('parameter', 'list', '[', $._const, ']', $._ids),

        identifier_list_id: $ => seq('identifier', 'list', '[', $.id, ']', $._ids),
        identifier_list_const: $ => seq('identifier', 'list', '[', $._const, ']', $._ids),

        transformation: $ => /[^@]*/,

        script_code: $ => /[^@]*/,

        _const: $ => choice(
            $.string,
            $.integer,
            $.dots
        ),

        string: $ => /"[^"]*"/,

        integer: $ => /[0-9]+/,

        dots: $ => '...',

        pathToIsoFile: $ => /<[^>]*>/,

        id: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

        _ids: $ => commaSep1($._pmid),

        _pmid: $ => choice($.id, $.mid),

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
