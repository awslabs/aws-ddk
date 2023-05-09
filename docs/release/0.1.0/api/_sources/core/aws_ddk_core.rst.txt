aws\_ddk\_core package
======================

* `Base`_
* `CICD`_
* `Config`_
* `Pipelines`_
* `Resources`_
* `Stages`_

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

Pipelines
-----------

.. currentmodule:: aws_ddk_core.pipelines

.. autosummary::
   :toctree: stubs
   :template: custom-class-template.rst

   Pipeline
   Stage

Resources
------------

.. currentmodule:: aws_ddk_core.resources

.. autosummary::
   :toctree: stubs
   :template: custom-class-template.rst

   KMSFactory
   LambdaFactory
   S3Factory
   SQSFactory

Stages
-----------

.. currentmodule:: aws_ddk_core.stages

.. autosummary::
   :toctree: stubs
   :template: custom-class-template.rst

   GlueTransformStage
   S3EventStage
   SqsToLambdaStage
