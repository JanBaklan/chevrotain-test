import React, {useState} from 'react';

import {createToken, EmbeddedActionsParser, Lexer} from 'chevrotain';

enum ESyntaxTypes {
  'Attribute' = 'Attribute',
}

const Autocomplete = {
  [ESyntaxTypes.Attribute]: ['hostname', 'os_family', 'os']
}

export const CONTEXT = createToken({name: 'Context', pattern: Lexer.NA, label: 'Context'});

export const ATTRIBUTE = createToken({
  name: 'Attribute',
  pattern: /hostname|os|os_family/,
  label: ESyntaxTypes.Attribute,
});

const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: Lexer.SKIPPED
});

export const Comma = createToken({
  name: 'Comma',
  pattern: /,/,
});

export const LeftPar = createToken({
  name: 'LeftPar',
  pattern: /\(/,
});

export const RightPar = createToken({
  name: 'RightPar',
  pattern: /\)/,
});

// CONTEXT
export const Consumer = createToken({
  name: 'Consumer',
  pattern: /consumer/,
  categories: CONTEXT,
});

export const Remote = createToken({
  name: 'Remote',
  pattern: /remote/,
  categories: CONTEXT,
});

const allTokens = [
  WhiteSpace,

  Comma, LeftPar, RightPar,

  CONTEXT,
  Consumer, Remote,

  ATTRIBUTE,
];

class AutocalcParser extends EmbeddedActionsParser {
  startRule!: () => void;
  atomRule!: () => void;
  constructor() {
    super(allTokens);

    this.RULE('startRule', () => {
      this.SUBRULE(this.atomRule);
    });

    this.RULE('atomRule', () => {
      this.CONSUME(CONTEXT);
      this.CONSUME(LeftPar);
      this.CONSUME(ATTRIBUTE);
      this.CONSUME(RightPar);
    });

    this.performSelfAnalysis();
  }
}


const AutocalcLexer = new Lexer(allTokens);
const parser = new AutocalcParser();

function App() {
  const [value, setValue] = useState('consumer(');

  const onChange = (value: string) => {
    setValue(value);
    const lexingResult = AutocalcLexer.tokenize(value)
    parser.input = lexingResult.tokens;
    parser.startRule();
    const options = parser.computeContentAssist('startRule', lexingResult.tokens);

    console.log(lexingResult.tokens);
    options.forEach(option => {
      console.log(Autocomplete[option.nextTokenType.name as ESyntaxTypes] || option.nextTokenType.name);
    });
  }

  return (
    <div className='App'>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />

      <ul>
        <li>start entering text "hostname"</li>
        <li>in console you can see autocomplete options</li>
        <li>after "hos" in textarea you can see "RightPar" in autocomplete options and 3 parsed tokens: <b> consumer, (, os</b></li>
        <li>how can I get 2 parsed tokens while "hos" is in textarea <b>consumer and (</b>?</li>
      </ul>
    </div>
  );
}

export default App;
