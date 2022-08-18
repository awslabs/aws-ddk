import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { AthenaSQLStage } from '../src';

test('AthenaToSQL stage creates State Machine', () => {
  const stack = new cdk.Stack();

  new AthenaSQLStage(stack, 'athena-sql', {
    queryString: 'SELECT 1',
    workGroup: 'primary',
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
    DefinitionString: {
      'Fn::Join': [
        '',
        Match.arrayWith([Match.stringLikeRegexp('start-query-exec')]),
      ],
    },
  });
});
