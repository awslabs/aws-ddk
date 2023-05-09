aws\_ddk\_core package
======================

* `Base`_
* `CICD`_
* `Config`_
* `Data Pipelines`_
* `Resources`_
* `Data Stages`_

Base
------

.. currentmodule:: aws_ddk_core.base

.. autosummary::
   :toctree: stubs
   :template: custom-class-template.rst

   BaseStack

CICD
------

.. currentmodule:: aws_ddk_core.cicd

.. autosummary::
   :toctree: stubs
   :template: custom-class-template.rst

   CICDPipelineStack

Config
------

.. currentmodule:: aws_ddk_core.config

.. autosummary::
   :toctree: stubs
   :template: custom-class-template.rst

   Config
   JSONConfigStrategy

Data Pipelines
---------------

.. currentmodule:: aws_ddk_core.pipelines

.. autosummary::
   :toctree: stubs
   :template: custom-class-template.rst

   DataPipeline
   DataStage
   EventStage
   StateMachineStage

Resources
------------

.. currentmodule:: aws_ddk_core.resources

.. autosummary::
   :toctree: stubs
   :template: custom-class-template.rst

   DMSFactory
   GlueFactory
   KinesisFirehoseFactory
   KinesisStreamsFactory
   KMSFactory
   LambdaFactory
   S3Factory
   SQSFactory
   StepFunctionsFactory

Data Stages
------------

.. currentmodule:: aws_ddk_core.stages

.. autosummary::
   :toctree: stubs
   :template: custom-class-template.rst

   AppFlowIngestionStage
   AthenaSQLStage
   DMSS3ToS3Stage
   GlueTransformStage
   KinesisToS3Stage
   S3EventStage
   SqsToLambdaStage
