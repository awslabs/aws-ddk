import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { GlueTransformStage } from '../src';

test('GlueTransformStage stage creates State Machine', () => {
  const stack = new cdk.Stack();

  new GlueTransformStage(stack, 'glue-transform', {
    jobName: 'myJob',
    crawlerName: 'myCrawler',
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
    DefinitionString: {
      'Fn::Join': [
        '',
        Match.arrayWith([
          Match.stringLikeRegexp('Start Job Run'),
          Match.stringLikeRegexp('Crawl Object'),
        ]),
      ],
    },
  });
});
