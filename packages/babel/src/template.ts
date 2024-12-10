import _templateBuilder, { smart, statement, statements, expression, program } from '@babel/template';

type DefaultTemplateBuilder = typeof smart & {
  smart: typeof smart;
  statement: typeof statement;
  statements: typeof statements;
  expression: typeof expression;
  program: typeof program;
  ast: typeof smart.ast;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
export const templateBuilder: DefaultTemplateBuilder = (_templateBuilder as any).default || _templateBuilder;
