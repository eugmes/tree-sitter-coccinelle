module.exports = grammar({
    name: 'coccinelle',

    word: $ => $.id,

    rules: {
        source_file: $ => seq(
            repeat($._include_cocci),
            repeat1($.changeset)
        ),

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

        changeset: $ => seq($.metavariables, $.transformation),

        metavariables: $ => seq(
            '@', optional($.rulename), '@',
            repeat($._metadecl),
            '@@'
        ),

        rulename: $ => seq(
            $.id,
            optional(seq('extends', $.id)),
            optional(seq('depends', 'on')),
            optional($.scope),
            $.dep,
            optional($.iso),
            optional($.disable_iso),
            optional($.exists),
            optional($.rulekind)
        ),

        scope: $ => choice('exists', 'forall'),

        dep: $ => choice(
            $.id,
            seq('!', $.id),
            seq('!', '(', $.dep, ')'),
            seq('ever', $.id),
            seq('never', $.id),
            prec.left(2, seq($.dep, '&&', $.dep)),
            prec.left(1, seq($.dep, '||', $.dep)),
            seq('file', 'in', $.string),
            seq('(', $.dep, ')')
        ),

        iso: $ => seq('using', $.string, repeat(seq(',', $.string))),

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

        _const: $ => choice(
            $.string,
            /[0-9]+/,
            '...'
        ),

        string: $ => /"[^"]*"/,

        pathToIsoFile: $ => /<.*>/,

        id: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

        _ids: $ => seq($.id, repeat(seq(',', $.id))),
    }
});
