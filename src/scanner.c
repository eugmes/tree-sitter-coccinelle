#include <tree_sitter/parser.h>

enum TokenType {
  _CODE_BLOCK
};

void *tree_sitter_coccinelle_external_scanner_create(void)
{
  return NULL;
}

void tree_sitter_coccinelle_external_scanner_destroy(void *payload) {
  (void)payload;
}

unsigned tree_sitter_coccinelle_external_scanner_serialize(void *payload, char *buffer)
{
  (void)payload;
  (void)buffer;
  return 0;
}

void tree_sitter_coccinelle_external_scanner_deserialize(
  void *payload,
  const char *buffer,
  unsigned length
)
{
  (void)payload;
  (void)buffer;
  (void)length;
}

static void advance(TSLexer *lexer)
{
  lexer->advance(lexer, false);
}

bool tree_sitter_coccinelle_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols)
{
  (void)payload;

  if (valid_symbols[_CODE_BLOCK]) {
    bool new_line = true;

    while (lexer->lookahead != 0) {
      if (lexer->lookahead == '\n') {
        new_line = true;
        advance(lexer);
      } else if ((lexer->lookahead == '@') && new_line){
        break;
      } else {
        new_line = false;
        advance(lexer);
      }
    }

    lexer->result_symbol = _CODE_BLOCK;
    return true;
  }

  return false;
}
