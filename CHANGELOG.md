
### [1.3.1](https://github.com/awslabs/aws-ddk/compare/v1.3.0...v1.3.1) (2023-10-12)

## [1.3.0](https://github.com/awslabs/aws-ddk/compare/v1.2.0...v1.3.0) (2023-10-12)


### Features

* Allowing 'any' in configuration props ([#419](https://github.com/awslabs/aws-ddk/issues/419)) ([a532a39](https://github.com/awslabs/aws-ddk/commit/a532a3954c0af74170964485b2858e5d7a2674f9))


### Bug Fixes

* Making 'configPath' optional in interfaces  ([#418](https://github.com/awslabs/aws-ddk/issues/418)) ([98f48f3](https://github.com/awslabs/aws-ddk/commit/98f48f376aeddc6a22dd29430dff7801a367b037))
* update Update MWAAEnviroment to create VPC and MWAAExecutionRole with resource prefix ([#439](https://github.com/awslabs/aws-ddk/issues/439)) ([a7cdd40](https://github.com/awslabs/aws-ddk/commit/a7cdd40135c85fea18b86649ac3ee34987db7d19))

## [1.2.0](https://github.com/awslabs/aws-ddk/compare/v1.1.0...v1.2.0) (2023-07-27)


### Features

* EMR Serverless Stage ([#390](https://github.com/awslabs/aws-ddk/issues/390)) ([cfd2252](https://github.com/awslabs/aws-ddk/commit/cfd2252989b35bff8632aace10da4539f5ea8b3a))
* New Construct `EMRServerlessCluster` ([#387](https://github.com/awslabs/aws-ddk/issues/387)) ([bf8cc36](https://github.com/awslabs/aws-ddk/commit/bf8cc3615b6b092dfb2814f5fa510d6ebbd9be38))

## [1.1.0](https://github.com/awslabs/aws-ddk/compare/v1.0.1...v1.1.0) (2023-07-05)


### Features

* adding `env` to synth action props ([#379](https://github.com/awslabs/aws-ddk/issues/379)) ([31cebd9](https://github.com/awslabs/aws-ddk/commit/31cebd9db4e7195f4c048b946de9c6ca29d93f1c))
* Airflow Data Pipeline Construct  ([#349](https://github.com/awslabs/aws-ddk/issues/349)) ([21fb743](https://github.com/awslabs/aws-ddk/commit/21fb74368ae4d427d288f3a25f05f69f790836a7))
* make crawler optional in `GlueTransformStage()` ([#378](https://github.com/awslabs/aws-ddk/issues/378)) ([49084a8](https://github.com/awslabs/aws-ddk/commit/49084a88b0d22bc658764590c02cb323c9abfd86))
* MWAA Stage ([#359](https://github.com/awslabs/aws-ddk/issues/359)) ([24d9895](https://github.com/awslabs/aws-ddk/commit/24d98954951a4a83abdb78a306f2001664835825))
* Update `StateMachineStage` to use `definitionBody` instead of deprecated `definition` ([#372](https://github.com/awslabs/aws-ddk/issues/372)) ([b0107df](https://github.com/awslabs/aws-ddk/commit/b0107dfda76cc9717ffc5921c2f3c42190aea9f4))

### [1.0.1](https://github.com/awslabs/aws-ddk/compare/v1.0.0...v1.0.1) (2023-06-13)


### Bug Fixes

* account/region determination in getStackSynthesizer ([#347](https://github.com/awslabs/aws-ddk/issues/347)) ([34dbe7e](https://github.com/awslabs/aws-ddk/commit/34dbe7ef339b29eb371b5af7912a3eb180771b2c))
* Adding failBuild parameter ([#337](https://github.com/awslabs/aws-ddk/issues/337)) ([a5c3264](https://github.com/awslabs/aws-ddk/commit/a5c3264dbdfebb2d0574ef486e597ff4d07bfa47))
* make 'configPath' optional ([#343](https://github.com/awslabs/aws-ddk/issues/343)) ([689c795](https://github.com/awslabs/aws-ddk/commit/689c79596c2d33d2d98d7b9c7c628d0c835f8ab1))
* removing default environment id from get stack synthesizer method ([#352](https://github.com/awslabs/aws-ddk/issues/352)) ([0fe3827](https://github.com/awslabs/aws-ddk/commit/0fe382733aff874a91f0741ddc5db0b6d8b97ded))

## [1.0.0-rc.0](https://github.com/awslabs/aws-ddk/compare/v1.0.0-beta.1...v1.0.0-rc.0) (2023-05-17)


### Features

* Add documentation for the stages ([#311](https://github.com/awslabs/aws-ddk/issues/311)) ([2c8e3eb](https://github.com/awslabs/aws-ddk/commit/2c8e3eb358c383f2cdc05c02ced963f2e3339b95))
* Updating AthenaSQL stage to handle multiple queries ([#317](https://github.com/awslabs/aws-ddk/issues/317)) ([0259ace](https://github.com/awslabs/aws-ddk/commit/0259aceead1b331a08339deb2cfe48ec8644ad7b))


### Bug Fixes

* athena integration test ([#326](https://github.com/awslabs/aws-ddk/issues/326)) ([bcb9940](https://github.com/awslabs/aws-ddk/commit/bcb9940ddea178af1319040d5be875d80d5aea04))
* Configurator missing legacy ddk bootstrap values ([#319](https://github.com/awslabs/aws-ddk/issues/319)) ([300f0fc](https://github.com/awslabs/aws-ddk/commit/300f0fcf1a2881a578af1887733a645bb3dbc749))
* Fix documentation structure & add docs for `BaseStack` and `CICDPipelineStack` ([#310](https://github.com/awslabs/aws-ddk/issues/310)) ([11d5a1e](https://github.com/awslabs/aws-ddk/commit/11d5a1e55882841b11e075a5a4fd4fb3fe9cba03))

## [1.0.0-beta.1](https://github.com/awslabs/aws-ddk/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2023-04-17)


### Features

* `getEnvironment()` ([#307](https://github.com/awslabs/aws-ddk/issues/307)) ([98bd743](https://github.com/awslabs/aws-ddk/commit/98bd74330d960bdc98ed03fdb72747a19aaa0818))
* Add support for `RemovalPolicy` in config ([#306](https://github.com/awslabs/aws-ddk/issues/306)) ([8799d19](https://github.com/awslabs/aws-ddk/commit/8799d19452704f16e9966fd1cab611e4f7a3357d))
* Add type interface for configuration ([#308](https://github.com/awslabs/aws-ddk/issues/308)) ([c5e6375](https://github.com/awslabs/aws-ddk/commit/c5e6375656068a8124a188d03b1b426a87c7e484))


### Bug Fixes

* Beta Testing Fixes ([#296](https://github.com/awslabs/aws-ddk/issues/296)) ([e1db71c](https://github.com/awslabs/aws-ddk/commit/e1db71c3bf9c7d3dfe503153f0a101cc8f44777e))

## 1.0.0-beta.0 (2023-03-31)


### Features

* `CICDPipelineStack()` updates ([#283](https://github.com/awslabs/aws-ddk/issues/283)) ([cca11f6](https://github.com/awslabs/aws-ddk/commit/cca11f6e7c0bd2c7ae0f0d7d03f0da0d0ed94ef9))
* Add data assertions for S3 -> SQS -> Lambda pipeline ([#242](https://github.com/awslabs/aws-ddk/issues/242)) ([57da74a](https://github.com/awslabs/aws-ddk/commit/57da74a2d6ef2ecca7d7e14a6a1fd3c110b7a334))
* Add FirehoseToS3Stage and tests ([#151](https://github.com/awslabs/aws-ddk/issues/151)) ([03216e5](https://github.com/awslabs/aws-ddk/commit/03216e568ffef8c12366b253b6b451c33c935971))
* Add support for Python in JSII and upgrade CDK version ([#148](https://github.com/awslabs/aws-ddk/issues/148)) ([c6343fc](https://github.com/awslabs/aws-ddk/commit/c6343fcd661e7dd157c1f3acbcc858472ccafecb))
* Adding core.cicd ([#139](https://github.com/awslabs/aws-ddk/issues/139)) ([9e5a22b](https://github.com/awslabs/aws-ddk/commit/9e5a22bad0148c71e76614ff79f9ad140b1ba56d))
* Adds `glueJob` and `crawlerName` to `GlueTransform` stage properties ([#266](https://github.com/awslabs/aws-ddk/issues/266)) ([18ca06d](https://github.com/awslabs/aws-ddk/commit/18ca06d9ee75ce552fdf8f7b6b86daf2fce2b459))
* appflow ingestion stage ([#222](https://github.com/awslabs/aws-ddk/issues/222)) ([3b659ea](https://github.com/awslabs/aws-ddk/commit/3b659ea7c542d8f20077b6adcdc1ba52a108ee6d))
* appflow stage refactor ([#230](https://github.com/awslabs/aws-ddk/issues/230)) ([1c84169](https://github.com/awslabs/aws-ddk/commit/1c84169efa70153214b538df44fab4c2e731da72))
* athena sql stage ([#145](https://github.com/awslabs/aws-ddk/issues/145)) ([f2594e9](https://github.com/awslabs/aws-ddk/commit/f2594e986a41d0ab7c7042666754b7b78868549e))
* configuration by resource ids ([#284](https://github.com/awslabs/aws-ddk/issues/284)) ([6b0120f](https://github.com/awslabs/aws-ddk/commit/6b0120f67f56b5865471695d71ed887bc2f38e90))
* ddk `configurator` ([#254](https://github.com/awslabs/aws-ddk/issues/254)) ([9b7f48d](https://github.com/awslabs/aws-ddk/commit/9b7f48dc5bb8190d56b3ed38b799e7b28d3c77e7)), closes [#247](https://github.com/awslabs/aws-ddk/issues/247)
* Integration Testing ([#235](https://github.com/awslabs/aws-ddk/issues/235)) ([6c2ba10](https://github.com/awslabs/aws-ddk/commit/6c2ba109bdab7e0536efbcbb766fc4374a259b92))
* Integration Tests: Additional Coverage ([#238](https://github.com/awslabs/aws-ddk/issues/238)) ([fdad682](https://github.com/awslabs/aws-ddk/commit/fdad682ff58be8b8a7d7fa46bc72c607fdc99b90))
* resource naming refactor ([#233](https://github.com/awslabs/aws-ddk/issues/233)) ([9d0d76f](https://github.com/awslabs/aws-ddk/commit/9d0d76fa1536ceab3f698c95421bd4973734858f))
* Set up project metadata ([#136](https://github.com/awslabs/aws-ddk/issues/136)) ([3647747](https://github.com/awslabs/aws-ddk/commit/3647747883a25b2f7236e96d77b23866a45bef1e))
* sns to lambda stage ([#252](https://github.com/awslabs/aws-ddk/issues/252)) ([709df57](https://github.com/awslabs/aws-ddk/commit/709df577a23456046a6068b56136d0e2dc99ff60))
* standardize defaults approach in ddk core ([#258](https://github.com/awslabs/aws-ddk/issues/258)) ([c2fa8ea](https://github.com/awslabs/aws-ddk/commit/c2fa8ea402333b41f9efb6d2b5f348d32b8ae603))
* Support local package path install in CICD synth action pre-public release ([#160](https://github.com/awslabs/aws-ddk/issues/160)) ([0e01da8](https://github.com/awslabs/aws-ddk/commit/0e01da88dfd9748b61ce93a8ed320d1a52819ebe))
* Supporting minimal resource factories  for `1.x.x` ([#290](https://github.com/awslabs/aws-ddk/issues/290)) ([da9ee85](https://github.com/awslabs/aws-ddk/commit/da9ee85fa9f75d85deddf098049ffbaf379a4881))
* syncing `GlueTransformStage` to `main` ([#262](https://github.com/awslabs/aws-ddk/issues/262)) ([8ce3623](https://github.com/awslabs/aws-ddk/commit/8ce3623be1ad0ee9d0249d03da4f74b1f4aef729))
* Typescript catchup -> 0.6.1 ([#214](https://github.com/awslabs/aws-ddk/issues/214)) ([a7bc0cc](https://github.com/awslabs/aws-ddk/commit/a7bc0cccd64639bceb611058b8243208b7d9b3b5))
* Typescript conversion  of `GlueTransformStage` ([#152](https://github.com/awslabs/aws-ddk/issues/152)) ([041ad13](https://github.com/awslabs/aws-ddk/commit/041ad131df0431da5fe452c4d59a7d5c99304a44))


### Bug Fixes

* cicd environment support ([#280](https://github.com/awslabs/aws-ddk/issues/280)) ([dbc8bfc](https://github.com/awslabs/aws-ddk/commit/dbc8bfc92fc609e6f1e20d50a11b9398cbd8f0c0))
* convert utility methods to `static` ([#269](https://github.com/awslabs/aws-ddk/issues/269)) ([77fdf71](https://github.com/awslabs/aws-ddk/commit/77fdf7191ffd9a6e309c12cec97679547b4ac148))
* Fix typescript s3 event pattern ([#149](https://github.com/awslabs/aws-ddk/issues/149)) ([fb33536](https://github.com/awslabs/aws-ddk/commit/fb33536bcbbdc5ca3f98a90e915cae5c5194a14b))
* move `getEnvConfig()` to static method ([#270](https://github.com/awslabs/aws-ddk/issues/270)) ([06d19e1](https://github.com/awslabs/aws-ddk/commit/06d19e1e335479a3be23b74578125f40c6752501))
* Remove whitespace from glue job sec configuration Id ([#275](https://github.com/awslabs/aws-ddk/issues/275)) ([3fa0ecd](https://github.com/awslabs/aws-ddk/commit/3fa0ecd11583d43bf4b79c4c79ceca6b19fb941c))
* static method `Configurator.getEnvConfig()` ([#282](https://github.com/awslabs/aws-ddk/issues/282)) ([b2dc1f7](https://github.com/awslabs/aws-ddk/commit/b2dc1f70fc5c9f4da81983b1ecda66486263c872))

