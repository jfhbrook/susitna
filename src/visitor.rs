// A pattern I learned from Crafting Interpreters. In the case of rust, it
// solves the "unpacking" problem really well. This pattern should help a ton
// with the pattern match vs method delegation problems that plagued me with
// s7bas.

enum Token {}

enum Value {}

trait ExprVisitor<R> {
    fn visit_binary_expr(&self, left: &Expr, operator: &Token, right: &Expr) -> R;
    fn visit_grouping_expr(&self, expression: &Expr) -> R;
    fn visit_literal_expr(&self, value: &Value) -> R;
    fn visit_unary_expr(&self, operator: &Token, right: &Expr) -> R;
}

enum Expr {
    Binary { left: Box<Expr>, operator: Token, right: Box<Expr> },
    Grouping { expression: Box<Expr> },
    Literal { value: Value },
    Unary { operator: Token, right: Box<Expr> }
}

impl Expr {
    fn accept<R, V>(self, visitor: &V) -> R
    where
        V: ExprVisitor<R>
    {
        match self {
            Expr::Binary { left, operator, right} => visitor.visit_binary_expr(&left, &operator, &right),
            Expr::Grouping { expression } => visitor.visit_grouping_expr(&expression),
            Expr::Literal { value } => visitor.visit_literal_expr(&value),
            Expr::Unary { operator, right } => visitor.visit_unary_expr(&operator, &right)
        }
    }
}

struct Printer {}

impl ExprVisitor<String> for Printer {
    fn visit_binary_expr(&self, left: &Expr, operator: &Token, right: &Expr) -> String {
        String::from("lol")
    }
    fn visit_grouping_expr(&self, expression: &Expr) -> String {
        String::from("lol")
    }
    fn visit_literal_expr(&self, value: &Value) -> String {
        String::from("lol")
    }
    fn visit_unary_expr(&self, operator: &Token, right: &Expr) -> String {
        String::from("unary expr")
    }
}

