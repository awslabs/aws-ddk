Search.setIndex({docnames:["cli/aws_ddk","core/aws_ddk_core","core/stubs/aws_ddk_core.base.BaseStack","core/stubs/aws_ddk_core.cicd.CICDPipelineStack","core/stubs/aws_ddk_core.config.Config","core/stubs/aws_ddk_core.config.JSONConfigStrategy","core/stubs/aws_ddk_core.pipelines.DataPipeline","core/stubs/aws_ddk_core.pipelines.DataStage","core/stubs/aws_ddk_core.pipelines.EventStage","core/stubs/aws_ddk_core.pipelines.StateMachineStage","core/stubs/aws_ddk_core.resources.DMSFactory","core/stubs/aws_ddk_core.resources.DataBrewFactory","core/stubs/aws_ddk_core.resources.GlueFactory","core/stubs/aws_ddk_core.resources.KMSFactory","core/stubs/aws_ddk_core.resources.KinesisFirehoseFactory","core/stubs/aws_ddk_core.resources.KinesisStreamsFactory","core/stubs/aws_ddk_core.resources.LambdaFactory","core/stubs/aws_ddk_core.resources.S3Factory","core/stubs/aws_ddk_core.resources.SQSFactory","core/stubs/aws_ddk_core.resources.StepFunctionsFactory","core/stubs/aws_ddk_core.stages.AppFlowIngestionStage","core/stubs/aws_ddk_core.stages.AthenaSQLStage","core/stubs/aws_ddk_core.stages.DMSS3ToS3Stage","core/stubs/aws_ddk_core.stages.DataBrewTransformStage","core/stubs/aws_ddk_core.stages.GlueTransformStage","core/stubs/aws_ddk_core.stages.KinesisToS3Stage","core/stubs/aws_ddk_core.stages.S3EventStage","core/stubs/aws_ddk_core.stages.SqsToLambdaStage","index"],envversion:{"sphinx.domains.c":2,"sphinx.domains.changeset":1,"sphinx.domains.citation":1,"sphinx.domains.cpp":4,"sphinx.domains.index":1,"sphinx.domains.javascript":2,"sphinx.domains.math":2,"sphinx.domains.python":3,"sphinx.domains.rst":2,"sphinx.domains.std":2,sphinx:56},filenames:["cli/aws_ddk.rst","core/aws_ddk_core.rst","core/stubs/aws_ddk_core.base.BaseStack.rst","core/stubs/aws_ddk_core.cicd.CICDPipelineStack.rst","core/stubs/aws_ddk_core.config.Config.rst","core/stubs/aws_ddk_core.config.JSONConfigStrategy.rst","core/stubs/aws_ddk_core.pipelines.DataPipeline.rst","core/stubs/aws_ddk_core.pipelines.DataStage.rst","core/stubs/aws_ddk_core.pipelines.EventStage.rst","core/stubs/aws_ddk_core.pipelines.StateMachineStage.rst","core/stubs/aws_ddk_core.resources.DMSFactory.rst","core/stubs/aws_ddk_core.resources.DataBrewFactory.rst","core/stubs/aws_ddk_core.resources.GlueFactory.rst","core/stubs/aws_ddk_core.resources.KMSFactory.rst","core/stubs/aws_ddk_core.resources.KinesisFirehoseFactory.rst","core/stubs/aws_ddk_core.resources.KinesisStreamsFactory.rst","core/stubs/aws_ddk_core.resources.LambdaFactory.rst","core/stubs/aws_ddk_core.resources.S3Factory.rst","core/stubs/aws_ddk_core.resources.SQSFactory.rst","core/stubs/aws_ddk_core.resources.StepFunctionsFactory.rst","core/stubs/aws_ddk_core.stages.AppFlowIngestionStage.rst","core/stubs/aws_ddk_core.stages.AthenaSQLStage.rst","core/stubs/aws_ddk_core.stages.DMSS3ToS3Stage.rst","core/stubs/aws_ddk_core.stages.DataBrewTransformStage.rst","core/stubs/aws_ddk_core.stages.GlueTransformStage.rst","core/stubs/aws_ddk_core.stages.KinesisToS3Stage.rst","core/stubs/aws_ddk_core.stages.S3EventStage.rst","core/stubs/aws_ddk_core.stages.SqsToLambdaStage.rst","index.rst"],objects:{"aws_ddk_core.base":[[2,0,1,"","BaseStack"]],"aws_ddk_core.base.BaseStack":[[2,1,1,"","__init__"]],"aws_ddk_core.cicd":[[3,0,1,"","CICDPipelineStack"]],"aws_ddk_core.cicd.CICDPipelineStack":[[3,1,1,"","__init__"],[3,1,1,"","add_checks"],[3,1,1,"","add_custom_stage"],[3,1,1,"","add_notifications"],[3,1,1,"","add_security_lint_stage"],[3,1,1,"","add_source_action"],[3,1,1,"","add_stage"],[3,1,1,"","add_synth_action"],[3,1,1,"","add_test_stage"],[3,1,1,"","add_wave"],[3,1,1,"","build"],[3,1,1,"","synth"]],"aws_ddk_core.config":[[4,0,1,"","Config"],[5,0,1,"","JSONConfigStrategy"]],"aws_ddk_core.config.Config":[[4,1,1,"","__init__"],[4,1,1,"","get_cdk_version"],[4,1,1,"","get_env"],[4,1,1,"","get_env_config"],[4,1,1,"","get_resource_config"],[4,1,1,"","get_tags"]],"aws_ddk_core.config.JSONConfigStrategy":[[5,1,1,"","__init__"],[5,1,1,"","get_config"]],"aws_ddk_core.pipelines":[[6,0,1,"","DataPipeline"],[7,0,1,"","DataStage"],[8,0,1,"","EventStage"],[9,0,1,"","StateMachineStage"]],"aws_ddk_core.pipelines.DataPipeline":[[6,1,1,"","__init__"],[6,1,1,"","add_notifications"],[6,1,1,"","add_rule"],[6,1,1,"","add_stage"]],"aws_ddk_core.pipelines.DataStage":[[7,1,1,"","__init__"],[7,1,1,"","add_alarm"],[7,2,1,"","cloudwatch_alarms"]],"aws_ddk_core.pipelines.EventStage":[[8,1,1,"","__init__"],[8,1,1,"","get_targets"]],"aws_ddk_core.pipelines.StateMachineStage":[[9,1,1,"","__init__"],[9,1,1,"","build_state_machine"],[9,1,1,"","get_event_pattern"],[9,1,1,"","get_targets"],[9,2,1,"","state_machine"]],"aws_ddk_core.resources":[[10,0,1,"","DMSFactory"],[11,0,1,"","DataBrewFactory"],[12,0,1,"","GlueFactory"],[13,0,1,"","KMSFactory"],[14,0,1,"","KinesisFirehoseFactory"],[15,0,1,"","KinesisStreamsFactory"],[16,0,1,"","LambdaFactory"],[17,0,1,"","S3Factory"],[18,0,1,"","SQSFactory"],[19,0,1,"","StepFunctionsFactory"],[1,3,1,"","pandas_sdk_layer"]],"aws_ddk_core.resources.DMSFactory":[[10,1,1,"","__init__"],[10,1,1,"","endpoint"],[10,1,1,"","endpoint_settings_s3"],[10,1,1,"","replication_instance"],[10,1,1,"","replication_task"]],"aws_ddk_core.resources.DataBrewFactory":[[11,1,1,"","__init__"],[11,1,1,"","job"]],"aws_ddk_core.resources.GlueFactory":[[12,1,1,"","__init__"],[12,1,1,"","job"]],"aws_ddk_core.resources.KMSFactory":[[13,1,1,"","__init__"],[13,1,1,"","key"]],"aws_ddk_core.resources.KinesisFirehoseFactory":[[14,1,1,"","__init__"],[14,1,1,"","delivery_stream"],[14,1,1,"","s3_destination"]],"aws_ddk_core.resources.KinesisStreamsFactory":[[15,1,1,"","__init__"],[15,1,1,"","data_stream"]],"aws_ddk_core.resources.LambdaFactory":[[16,1,1,"","__init__"],[16,1,1,"","function"]],"aws_ddk_core.resources.S3Factory":[[17,1,1,"","__init__"],[17,1,1,"","bucket"]],"aws_ddk_core.resources.SQSFactory":[[18,1,1,"","__init__"],[18,1,1,"","queue"]],"aws_ddk_core.resources.StepFunctionsFactory":[[19,1,1,"","__init__"],[19,1,1,"","state_machine"]],"aws_ddk_core.stages":[[20,0,1,"","AppFlowIngestionStage"],[21,0,1,"","AthenaSQLStage"],[22,0,1,"","DMSS3ToS3Stage"],[23,0,1,"","DataBrewTransformStage"],[24,0,1,"","GlueTransformStage"],[25,0,1,"","KinesisToS3Stage"],[26,0,1,"","S3EventStage"],[27,0,1,"","SqsToLambdaStage"]],"aws_ddk_core.stages.AppFlowIngestionStage":[[20,1,1,"","__init__"],[20,2,1,"","flow"]],"aws_ddk_core.stages.AthenaSQLStage":[[21,1,1,"","__init__"],[21,1,1,"","get_targets"]],"aws_ddk_core.stages.DMSS3ToS3Stage":[[22,1,1,"","__init__"],[22,2,1,"","event_pattern"],[22,1,1,"","get_event_pattern"],[22,1,1,"","get_targets"]],"aws_ddk_core.stages.DataBrewTransformStage":[[23,1,1,"","__init__"],[23,2,1,"","job"]],"aws_ddk_core.stages.GlueTransformStage":[[24,1,1,"","__init__"],[24,2,1,"","crawler"],[24,2,1,"","job"]],"aws_ddk_core.stages.KinesisToS3Stage":[[25,1,1,"","__init__"],[25,2,1,"","bucket"],[25,2,1,"","data_stream"],[25,2,1,"","delivery_stream"],[25,2,1,"","event_pattern"],[25,1,1,"","get_event_pattern"],[25,1,1,"","get_targets"]],"aws_ddk_core.stages.S3EventStage":[[26,1,1,"","__init__"],[26,2,1,"","event_pattern"],[26,1,1,"","get_event_pattern"]],"aws_ddk_core.stages.SqsToLambdaStage":[[27,1,1,"","__init__"],[27,2,1,"","dlq"],[27,2,1,"","function"],[27,1,1,"","get_event_pattern"],[27,1,1,"","get_targets"],[27,2,1,"","queue"]],"ddk-bootstrap":[[0,4,1,"cmdoption-ddk-bootstrap-e","--environment"],[0,4,1,"cmdoption-ddk-bootstrap-i","--iam-policies"],[0,4,1,"cmdoption-ddk-bootstrap-permissions-boundary","--permissions-boundary"],[0,4,1,"cmdoption-ddk-bootstrap-prefix","--prefix"],[0,4,1,"cmdoption-ddk-bootstrap-p","--profile"],[0,4,1,"cmdoption-ddk-bootstrap-qualifier","--qualifier"],[0,4,1,"cmdoption-ddk-bootstrap-r","--region"],[0,4,1,"cmdoption-ddk-bootstrap-t","--tags"],[0,4,1,"cmdoption-ddk-bootstrap-a","--trusted-accounts"],[0,4,1,"cmdoption-ddk-bootstrap-a","-a"],[0,4,1,"cmdoption-ddk-bootstrap-e","-e"],[0,4,1,"cmdoption-ddk-bootstrap-i","-i"],[0,4,1,"cmdoption-ddk-bootstrap-p","-p"],[0,4,1,"cmdoption-ddk-bootstrap-r","-r"],[0,4,1,"cmdoption-ddk-bootstrap-t","-t"]],"ddk-create-repository":[[0,4,1,"cmdoption-ddk-create-repository-d","--description"],[0,4,1,"cmdoption-ddk-create-repository-p","--profile"],[0,4,1,"cmdoption-ddk-create-repository-r","--region"],[0,4,1,"cmdoption-ddk-create-repository-t","--tags"],[0,4,1,"cmdoption-ddk-create-repository-d","-d"],[0,4,1,"cmdoption-ddk-create-repository-p","-p"],[0,4,1,"cmdoption-ddk-create-repository-r","-r"],[0,4,1,"cmdoption-ddk-create-repository-t","-t"],[0,4,1,"cmdoption-ddk-create-repository-arg-NAME","NAME"]],"ddk-deploy":[[0,4,1,"cmdoption-ddk-deploy-f","--force"],[0,4,1,"cmdoption-ddk-deploy-o","--output-dir"],[0,4,1,"cmdoption-ddk-deploy-p","--profile"],[0,4,1,"cmdoption-ddk-deploy-require-approval","--require-approval"],[0,4,1,"cmdoption-ddk-deploy-f","-f"],[0,4,1,"cmdoption-ddk-deploy-o","-o"],[0,4,1,"cmdoption-ddk-deploy-p","-p"],[0,4,1,"cmdoption-ddk-deploy-arg-STACKS","STACKS"]],"ddk-init":[[0,4,1,"cmdoption-ddk-init-e","--environment"],[0,4,1,"cmdoption-ddk-init-generate-only","--generate-only"],[0,4,1,"cmdoption-ddk-init-t","--template"],[0,4,1,"cmdoption-ddk-init-e","-e"],[0,4,1,"cmdoption-ddk-init-t","-t"],[0,4,1,"cmdoption-ddk-init-arg-NAME","NAME"]],ddk:[[0,4,1,"cmdoption-ddk-debug","--debug"],[0,4,1,"cmdoption-ddk-debug","--no-debug"],[0,4,1,"cmdoption-ddk-version","--version"]]},objnames:{"0":["py","class","Python class"],"1":["py","method","Python method"],"2":["py","property","Python property"],"3":["py","function","Python function"],"4":["std","cmdoption","program option"]},objtypes:{"0":"py:class","1":"py:method","2":"py:property","3":"py:function","4":"std:cmdoption"},terms:{"0":[1,27],"1":[0,7,9,11,12,13,14,15,16,20,21,23,24,25,27],"10":27,"111111111111":0,"120":[16,27],"128":[14,25],"15":20,"17":1,"1984":0,"2":[1,11,12,13,16,24],"222222222222":0,"256":[16,27],"3":[11,12,13,16,24],"30":13,"300":[14,25],"31":10,"3600":[11,12,15],"5":[7,14,25,27],"60":[14,25],"900":[14,25],"class":[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],"default":[0,1,3,4,5,6,7,9,10,11,12,13,14,15,16,17,18,20,21,23,24,25,26,27],"function":[10,14,15,16,17,18,19,20,21,23,24,27],"int":[7,9,10,11,12,15,16,20,21,23,24,25,27],"new":[0,25],"null":10,"public":[10,17],"return":[1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],"static":[10,11,12,13,14,15,16,17,18,19],"super":[7,8],"true":[0,7,9,10,13,14,17,20,21,23,24,25,27],"while":10,A:[0,10,11,14,15,24,25,27],By:6,For:[6,7,8,10,11,12,13,14,15,16,17,18,19,22,24,27],If:[0,1,2,10,12,14,15,20,23,24,25],It:[3,10,26,27],One:11,The:[0,3,7,9,10,11,12,13,14,15,16,17,20,21,22,23,24,25,26,27],To:[7,8],_:3,__init__:[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],_event_pattern:8,_queue:7,abil:3,abl:[3,10],about:10,access:[10,15,17],access_control:17,account:[0,2,3,4],acl:17,action:3,add:[3,6,7,8,9,14,20,21,23,24,25,27],add_alarm:7,add_check:3,add_custom_stag:3,add_notif:[3,6],add_rul:6,add_security_lint_stag:3,add_source_act:3,add_stag:[3,6],add_synth_act:3,add_test_stag:3,add_wav:3,addit:[2,3,9,10,11,12,13,14,15,16,17,18,19,20,21,23,24,27],additional_role_policy_stat:[9,20,21,23,24],address:10,after:[3,11,12,16,25,27],afterward:24,against:7,alarm:[7,9,20,21,23,24,25,27],alarm_comparison_oper:7,alarm_evaluation_period:7,alarm_id:7,alarm_metr:7,alarm_threshold:7,alarms_en:[7,9,20,21,23,24,25,27],alia:[13,15],all:[7,9,20,21,23,24,25,27],alloc:[10,12,16,27],allocated_storag:10,allow:[10,11,12,13,14,15,16,17,18,19,24],allow_all_outbound:16,allow_major_version_upgrad:10,allow_public_subnet:16,alwai:[0,11,12,13,16],amazon:[2,3,10,11,12,13,14,15,16,17,18,19,22,24,25,26,27],amazons3:26,amount:[10,16,27],an:[6,8,9,10,15,20,21,22,25,26,27],analyz:11,ani:[0,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],api:[3,10,11,12,13,14,15,16,17,18,19,20,21,23,24,27],app:3,appear:[14,25],appflow:20,appli:[0,10,11,15,17,18],applic:[2,3],approv:[0,3],ar:[0,3,8,9,10,11,12,13,14,15,16,17,18,19,21,22,24,25,27],arg:[0,2,3,6,7,8,9,20,21,22,23,24,25,26,27],argument:[0,2,11,12,13,16,20,21,23,24],arn1:0,arn2:0,arn:[0,2,3,10,11,23],artifact:[3,11],artifactori:3,ascii:10,assembl:[0,3],associ:[10,14],assum:14,athena:21,attach:0,attribut:[2,3,6,7,8,9,20,21,22,23,24,25,26,27],aurora:10,auto:6,auto_delete_object:17,auto_minor_version_upgrad:10,automat:[10,15],avail:10,availability_zon:10,availabilityzon:10,avoid:3,aw:[0,1,2,3,4,8,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],aws_appflow:20,aws_cdk:[1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],aws_cloudwatch:7,aws_codestarnotif:3,aws_databrew:[11,23],aws_ddk:28,aws_ddk_cor:28,aws_dm:10,aws_ev:[6,8,9,21,22,25,26,27],aws_glu:24,aws_glue_alpha:[12,24],aws_iam:[3,9,12,14,16,20,21,23,24,27],aws_kinesi:[14,15,25],aws_kinesisfirehos:14,aws_kinesisfirehose_alpha:[14,25],aws_kinesisfirehose_destin:14,aws_kinesisfirehose_destinations_alpha:[14,25],aws_km:[13,14,15,21,25],aws_lambda:[1,16,27],aws_log:[14,25],aws_s3:[14,17,22,25],aws_sn:6,aws_sq:[16,18,27],aws_stepfunct:[9,19],aws_stepfunctions_task:21,awslab:[2,3,20,21,23,24],az:10,azuredb:10,back:14,bandit:3,base:[3,26,28],batch:27,batch_siz:27,been:13,befor:[9,13,14,20,21,23,24,25,27],being:27,best:3,between:20,block:[3,17],block_al:17,block_public_access:17,blockpublicaccess:17,bool:[2,3,6,7,9,10,13,14,16,17,19,20,21,23,24,25,27],bootstrap:2,boundari:[0,2],branch:3,broaden:0,bucket:[3,10,14,17,18,21,22,25,26],bucket_fold:10,bucket_nam:[10,17,25,26],bucket_owner_full_control:17,bucket_prop:17,bucketaccesscontrol:17,bucketencrypt:17,bucketfold:10,buffer:[14,25],buffering_interv:[14,25],buffering_s:[14,25],build:[3,9],build_state_machin:[9,20,21,23,24],builder:3,c5:22,call:[3,16,27],can:[2,3,5,10,11,15,17,27],capac:[10,15],captur:26,catalog:21,catalog_nam:21,cd:3,cdc:10,cdk:[0,1,2,3,4,10,11,12,13,14,15,16,17,18,19,24,27],cdk_version:[3,4],cfn:3,cfncrawler:24,cfnendpoint:10,cfnflow:20,cfnjob:[11,23],cfnreplicationinst:10,cfnreplicationtask:10,chang:0,chap_sourc:22,chap_task:[10,22],charact:10,check:[3,20],choos:[10,15],chunki:3,ci:3,cicd:28,cicdpipelin:3,cli:0,cloud:[0,3,10],cloud_assembly_file_set:3,cloudform:[6,13,15],cloudwatch:[7,11,14,25],cloudwatch_alarm:7,cmk:[13,14],code:[0,3,16,27],codeartifact:3,codeartifact_domain:3,codeartifact_domain_own:3,codeartifact_repositori:3,codebuildstep:3,codecommit:3,codepipelin:3,codepipelinesourc:3,collect:24,com:[2,3,10,11,12,13,14,15,16,17,18,19,22,24,26,27],command:[0,3],common:[14,15,19],compar:[7,9,20,21,23,24,27],comparison:7,comparisonoper:7,complet:[10,11,12,13,14,15,16,17,18,19,24,25,27],compress:[14,25],comput:10,condit:10,config:[3,28],config_strategi:4,configstrategi:4,configur:[2,3,4,5,10,11,12,13,14,15,16,17,18,19,21],connect:[3,27],construct:[1,2,3,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],constructor:3,consum:[6,11],contain:[0,3,4,5,10,20,21,23,24],content:18,content_based_dedupl:18,continu:3,core:[20,21,23,24],costcent:0,crawl:24,crawler:24,crawler_allow_failur:24,crawler_nam:24,crawler_rol:24,crawlerrunningexcept:24,creat:[2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,23,24,25,26],creation:[6,9,20,21,23,24,25],credenti:0,csv:10,custom:[3,6,12,14],customizingtask:[10,22],cw:[9,20,21,23,24,27],d:0,dai:13,data:[6,7,8,9,10,11,14,15,20,21,22,23,24,25,27,28],data_key_reus:18,data_output_prefix:[14,25],data_stream:[15,25],data_stream_en:25,databas:[21,24],database_nam:[21,24],databrew:[11,23],dataset:[11,23],dataset_nam:[11,23],datastag:[6,9,20,21,23,24],db2:10,dd:25,ddd:10,ddk:[1,2,3,4,5,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],dead:27,dead_letter_queu:[16,18],dead_letter_queue_en:[16,27],deadletterqueu:[18,27],debug:0,def:[7,8],default_argu:12,defaultstacksynthes:2,defin:[2,3,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],definit:[9,10,22],delet:13,deliv:[14,25],deliveri:[3,14,25],delivery_delai:18,delivery_stream:[14,25],delivery_stream_nam:[14,25],deliverystream:14,depend:[10,11,12,13,14,15,16,17,18,19],deploi:[2,3],deploy:[0,3,10],dequeu:[18,27],describ:[8,9,21,22,25,26,27],descript:[0,6,7,8,9,12,16],destin:[10,14,22,25],destination_flow_config:20,destination_prop:14,destinationflowconfigproperti:20,destinations3backupprop:14,detail:[3,7,8],detail_typ:[7,8],determin:[4,11,16,27],dev:[0,3],devstag:3,dict:[2,3,4,9,20,21,23,24,27],dictionari:[4,5],differ:5,differnet:2,digit:10,dir:0,directori:0,disabl:[7,9,10,20,21,23,24,25,27],disambigu:2,displai:10,distinct:10,distribut:11,dlq:[16,27],dm:[10,22],doc:[2,3,10,11,12,13,14,15,16,17,18,19,22,24,26,27],docdb:10,document:[3,10,11,12,13,14,15,16,17,18,19,22,24,27],domain:3,domain_own:3,don:10,durat:[11,12,13,14,15,16,19,20,24,25,27],dure:[3,10],dynam:21,dynamodb:10,e:[0,1,3],east:0,effect:25,elasticsearch:10,empti:2,enabl:[2,7,9,10,16,19,20,21,23,24,25,26,27],enable_key_rot:13,enable_profiling_metr:12,enable_statist:10,encrypt:[3,10,11,13,14,15,17,18,21,25],encryption_kei:[14,15,21,25],encryption_mod:11,encryption_opt:21,encryptionkei:15,encryptionopt:21,end:10,endpoint:10,endpoint_prop:10,endpoint_s3_prop:10,endpoint_settings_s3:10,endpoint_settings_s3_prop:10,endpoint_typ:10,endpointarn:10,endpointtyp:10,enforc:[15,17],enforce_ssl:17,engin:10,engine_nam:10,engine_vers:10,ensur:3,env:[3,4],env_config:4,environ:[0,1,2,3,4,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],environment_id:[1,2,3,4,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],error:[14,24,25,27],error_output_prefix:[14,25],evalu:[14,25],even:0,event:[3,6,8,9,21,22,25,26,27],event_bridge_en:17,event_nam:[8,26],event_pattern:[6,8,9,22,25,26,27],event_target:6,eventbridg:[17,25,26],eventpattern:[6,7,8,9,22,25,26,27],everi:24,exampl:[3,6,7,8,26],execpt:24,execut:[9,11,12,16,20,21,23,24,27],execute_security_lint:3,execute_test:3,exist:[3,6],exit:0,explicit:[11,12,13,16],extern:[10,15,22],external_table_definit:[10,22],externaltabledef:22,externaltabledefinit:10,f:0,factori:[10,11,12,13,14,15,16,17,18,19],fail:[9,14,20,21,23,24,25],failur:24,fals:[0,3,6,10,16,17,25,27],featur:3,fifo:27,file:[0,3,5,10,11,12,13,14,15,16,17,18,19],firehos:[14,15,25],firehose_prop:14,flow:20,flow_execution_status_check_period:20,flow_nam:20,fn:16,folder:10,follow:[11,12,13,14,16,25],forc:0,form:4,format:[10,22],framework:0,from:[0,1,2,3,4,5,7,8,11,12,13,14,16,17,18,22,27],front:25,full:10,function_nam:16,function_prop:[16,27],g:[0,3],gather:27,gener:[0,6,15],get:[4,5,8,9,21,22,24,25,26,27],get_cdk_vers:4,get_config:5,get_env:4,get_env_config:4,get_event_pattern:[7,8,9,22,25,26,27],get_resource_config:4,get_tag:4,get_target:[6,7,8,9,21,22,25,27],gigabyt:10,git:0,github:[2,3,20,21,23,24],given:[4,5],glue:[12,24],glue_crawler_arg:24,glue_job_arg:24,grant:17,greater_than_threshold:7,group:[10,14,25,27],guid:2,gzip:[14,25],ha:13,handler:[16,27],have:[2,10,17,25],helper:9,hh24:10,hh:25,hold:[14,25],hope:3,hour:15,how:[2,3,4,22,24],html:[2,3,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,26,27],http:[2,3,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,26,27],hyphen:10,i:[0,1],ialarm:7,iam:[0,9,10,14,20,21,23,24],iam_polici:0,ibucket:[14,17,22,25],ichain:9,id:[0,1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],idataprocessor:14,ideliverystream:[14,25],ident:0,identifi:[2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],idestin:14,ifilesetproduc:3,ifunct:[16,27],ignor:12,ijob:[12,24],ikei:[13,14,15,25],ilayervers:27,iloggroup:[14,25],imetr:7,immedi:[14,25],implement:[7,8,26,27],implicitli:[14,25],includ:[2,3,10,11,12,13,14,15,16,17,18,19],incom:[14,25],index:28,indic:[10,13,14],infer:0,inform:[10,22],infrastructur:[3,7,8],ingest:[20,25],inherit:[2,7,8],initi:[10,24],input:[8,9,20,21,22,23,24,25,27],instanc:[3,4,6,10],integr:3,interfac:3,interpret:22,interv:24,invoc:27,invok:[8,9,14,21,22,25,27],io:[2,3,20,21,23,24],ip:10,iqueu:[16,18,27],irol:[12,14,16,24,27],iruletarget:[6,7,8,9,21,22,25,27],isecurityconfigur:12,isn:10,istream:[14,15],itop:6,its:[11,25],job:[11,12,23,24],job_arg:24,job_nam:[12,23,24],job_prop:[11,12],job_rol:24,job_role_arn:23,job_typ:23,jobexecut:[12,24],json:[3,4,5,10,11,12,13,14,15,16,17,18,19,22],jsonconfigstrategi:4,kafka:10,kb:10,kei:[2,3,5,10,11,13,14,15,18,21,25,26],key_prefix:26,key_prop:13,kind:[15,17],kinesi:[10,14,15,25],kinesis_delivery_stream_alarm_evaluation_period:25,kinesis_delivery_stream_alarm_threshold:25,kinesis_prop:15,km:[3,10,11,13,14,15,21,25],kms_key_id:10,kms_manag:18,kmskeyid:10,kwarg:[2,3,6,7,8,9,20,21,22,23,24,25,26,27],l1:24,lambda:[1,16,27],lambda_funct:27,lambda_function_errors_alarm_evaluation_period:27,lambda_function_errors_alarm_threshold:27,larg:22,latest:[1,2,3,10,20,21,22,23,24,26],layer:[1,27],layervers:1,leav:2,length:[14,25],letter:[10,27],level:[2,26],like:24,link:7,lint:3,list:[0,3,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],lmbda:1,load:[5,10],loc:3,local:0,locat:11,log:[0,11,14,25],log_group:[14,25],log_subscript:11,loggroup:14,logic:1,longer:24,lookup:1,lowercas:10,machin:[9,19,20,21,23,24],main:3,mainten:10,major:10,manag:[0,1,2,11,13,14],mani:24,manual:[0,3],manual_approv:3,map:[10,22],mariadb:10,master:[14,15],match:[6,8,9,21,22,25,27],max:10,max_batching_window:27,max_capac:11,max_concurrent_run:12,max_event_ag:16,max_file_s:10,max_message_size_byt:18,max_receive_count:27,max_retri:[11,12],maximum:[10,11,14,19,25,27],mb:[16,27],mebibyt:[14,25],memori:[10,16,27],memory_s:[16,27],messag:[18,27],message_group_id:27,method:[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],metric:7,mi:10,migrat:10,migration_typ:10,min:10,minimum:[14,25,27],minor:10,minut:27,mm:25,mode:[11,15],modifi:3,modul:28,mongodb:10,more:[3,10,11,22],move:27,much:24,multi:[2,10],multi_az:10,multipl:[2,3,24],must:[10,11,15,25,26,27],mutat:3,my:[3,6,7],my_glue_stag:6,my_lambda_stag:6,mypipelin:3,mysql:10,mystag:[7,8],nag:3,name:[0,1,2,3,6,7,8,9,10,11,12,14,15,16,17,18,19,20,21,23,24,25,26,27],need:0,neptun:10,never:0,next:6,node:11,non:3,none:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],noqa:[20,21,23,24],notif:[3,6,17,25,26],notification_rul:3,notificationrul:3,notifications_top:6,notifications_topic_arn:3,number:[7,9,10,11,12,13,15,18,20,21,23,24,27],o:0,object:[10,14,16,20,24,25,26,27],occur:10,off:0,one:[6,11,25],onli:[0,2,10,15],opensearch:10,oper:7,option:[0,1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],oracl:10,order:[11,12,13,16,25,26],other:[2,10],otherwis:[3,11,12,13,15,16],output:[0,6,9,11,21,22,23,24,25,26,27],output_bucket_nam:21,output_dir:0,output_loc:11,output_object_kei:21,outputlocationproperti:11,outputproperti:[11,23],over:[7,9,20,21,23,24,27],overal:10,overrid:[3,6,25],override_rul:6,owner:3,p:0,page:[10,28],pair:2,panda:1,pandas_sdk_lay:1,parallel:3,paramat:9,paramet:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],parquet:10,particular:[15,24],pass:[9,12,20,21,23,24],path:[5,10,21],pattern:[6,8,9,22,25,26,27],pending_window:13,perform:[0,14],period:[7,9,13,20,21,23,24,25,27],permiss:[0,2,10,14,17],permissions_boundari:0,permissions_boundary_arn:2,physic:15,pipelin:[3,20,21,23,24,28],pipeline_arg:3,pipeline_nam:3,polici:[0,2,3,9,17,18,20,21,23,24],policystat:[3,9,20,21,23,24],possibl:3,postgr:10,postgresql:10,practic:3,predefin:[12,17],preexist:[23,24,25,27],prefer:[11,12,13,16],preferred_maintenance_window:10,prefix:[0,2,14,22,25,26],previou:6,previous_stag:6,privat:[3,10],process:[11,27],processor:14,produc:[3,9,22,25,26,27],profil:[0,11,16],project:0,properti:[2,3,7,8,9,10,11,12,13,14,15,16,17,18,19,20,22,23,24,25,26,27],protect:2,provid:[0,4,10,14,15,25],provis:15,publicly_access:10,pull:[1,3],pytest:3,python:[0,3,10,11,12,13,14,15,16,17,18,19,24,27],python_3_9:27,qualifi:[0,2],queri:21,query_str:21,query_string_path:21,queue:[7,16,18,27],queue_nam:18,queue_prop:[18,27],queueencrypt:18,r:0,rai:19,rang:[10,27],read:[4,5,14],receive_message_wait_tim:18,recip:[11,23],recipeproperti:[11,23],record:[14,15,25,27],redshift:10,refer:[10,11,12,13,14,15,16,17,18,19,24,27],region:[0,1,4,15],releas:[2,3,20,21,23,24],remain:15,remov:[13,17,18],removal_polici:[13,17,18],removalpolici:[13,17,18],replic:[10,22],replication_inst:10,replication_instance_arn:10,replication_instance_class:[10,22],replication_instance_identifi:10,replication_instance_prop:10,replication_subnet_group_identifi:10,replication_task:10,replication_task_prop:10,replication_task_set:10,repo:[0,3,4,5],repositori:3,repository_nam:3,repres:[4,6,7,8,10,11,20,21,22,23,24,25,26,27],request:17,requir:[0,7,8,10,23,27],require_approv:0,reserved_concurrent_execut:16,resourc:[0,4,28],resource_identifi:10,respect:[11,12,13,16],respons:10,retain:[13,17,18],retention_period:[15,18],retri:[11,24],retriev:[1,27],retry_attempt:16,reus:3,role:[0,3,9,10,11,12,14,16,20,21,23,24,27],role_arn:11,role_policy_stat:3,root:[4,5,26],rotat:[3,13],rout:[9,22,25,26,27],row:10,rule:[3,6,8,9,21,22,25,26,27],rule_nam:6,run:[3,12,19,20,23,24],runtim:[16,27],s3:[8,10,11,14,17,21,22,25,26],s3_backup:14,s3_destin:14,s3_manag:17,s3_set:10,s3bucket:14,s3settingsproperti:10,s:[7,9,22,24,25,26,27],same:2,save:3,schema_nam:10,scm:3,scope:[1,2,3,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],sdk:1,search:28,second:[11,12,14,15,16,20,24,25,27],secur:[0,3,10,12],security_configur:12,security_configuration_nam:12,see:[3,10,20,21,22,23,24],select:[9,22,25,26,27],self:[3,6,7,8],send:[3,17,18],sensit:0,sent:27,sequenc:[11,14],seri:[11,23],server:[11,14,15,17],servic:[13,17,18,19],service_access_role_arn:10,set:[0,2,3,10,14,15,25,27],sever:3,sfn:19,sh:3,shard:15,shard_count:15,should:[0,3,4,8,9,10,13,14,17,21,22,25,27],show:0,side:[11,14,15,17],simpl:[17,18],simplifi:9,singl:27,size:[10,11,14,25],skip:6,skip_rul:6,sn:[3,6],some:3,sourc:[0,3,8,10,14,16,22,27],source_act:3,source_bucket:22,source_bucket_prefix:22,source_endpoint_arn:10,source_flow_config:20,source_stream:14,sourceflowconfigproperti:20,specif:[0,3,6],specifi:[1,3,5,6,7,9,10,13,15,17,19,20,21,23,24,27],sq:[7,16,18,27],sql:21,sqlserver:10,sqs_queue:27,sqsfactori:7,sqsqueue:7,sse:11,ssl:[3,17],stack:[0,1,2,3,13,17,18],stage:[3,6,7,8,9,28],stage_id:3,stage_nam:3,standard:2,start:[3,21],state:[9,19,20,21,23,24],state_machin:[9,19],state_machine_arg:[20,21,23,24],state_machine_failed_executions_alarm_evaluation_period:[9,20,21,23,24],state_machine_failed_executions_alarm_threshold:[9,20,21,23,24],state_machine_input:[9,20,21,23,24],state_machine_nam:19,state_machine_prop:19,state_machine_retry_backoff_r:24,state_machine_retry_interv:24,state_machine_retry_max_attempt:24,state_machine_typ:19,statemachin:[9,19,21],statemachinestag:[20,21,23,24],statemachinetyp:19,statement:[9,20,21,23,24],statist:[7,10],statu:[11,20],step:[3,11,19,20,21,23,24],stepfunct:24,storag:[10,17],store:[10,15,24],str:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],strategi:4,stream:[14,15,25],stream_mod:15,stream_nam:15,streamencrypt:[14,15],streammod:15,string:10,structur:[0,3,9,22,25,26,27],stub:[20,21,23,24],subnet:10,success:24,suppli:[15,20,24],support:[2,3,10,11,12,13,14,15,16,17,18,19],sybas:10,synth:3,synth_act:3,synthes:[0,2,3],system:[0,10],t:[0,10],tabl:[10,22],table_map:[10,22],table_nam:10,tablemap:22,tag:[0,2,4],tag_kei:4,target:[6,8,9,10,21,22,24,25,26,27],target_bucket:22,target_bucket_prefix:22,target_endpoint_arn:10,targetsproperti:24,task:[10,20,22],taskproperti:20,taskset:10,templat:0,termin:[2,11,12,16,27],termination_protect:2,test:3,thei:[18,24],them:[3,9,14,22,25,26,27],thi:[2,3,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],threshold:[7,9,20,21,23,24,25,27],through:15,time:[10,11,12,14,16,18,19,20,24,25,27],timeout:[11,12,16,19,27],topic:[3,6],trace:[16,19],tracing_en:19,transform:[11,14,23,24,25,27],trigger:[9,20,21,23,24,27],trust:0,trusted_account:0,turn:[0,17],type:[1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],unencrypt:[14,15],union:[10,26],uniqu:10,unsuccessfulli:[18,27],up:[0,10,14],upgrad:10,url:0,us:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,21,22,23,25,26,27],user:3,userguid:[10,22,26],usual:6,utc:10,v1:[3,10,14,15],v2:[2,3,10,11,12,13,16,17,18,19,24,27],valid:[10,27],valu:[1,2,4,7,10,11,12,13,16,25,27],version:[0,1,3,4,10,17],via:[3,6,15],virtual:[0,10],visibility_timeout:[18,27],vpc:10,vpc_security_group_id:10,wait:[13,20,24],wave:3,weekli:10,were:18,what:[0,8,9,18,21,22,25,27],when:[1,8,9,10,12,13,14,17,18,21,22,25,27],where:[0,4,14,25],whether:[10,13,17,18,19],which:[2,3,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],window:[10,27],wire:6,within:[2,3,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],without:0,work:10,worker:12,worker_count:12,worker_typ:12,workertyp:12,workgroup:21,write:[14,25],x:19,you:[2,10,14,15,25],your:[0,3,10,14,25],yyyi:25,zone:10},titles:["aws_ddk package","aws_ddk_core package","aws_ddk_core.base.BaseStack","aws_ddk_core.cicd.CICDPipelineStack","aws_ddk_core.config.Config","aws_ddk_core.config.JSONConfigStrategy","aws_ddk_core.pipelines.DataPipeline","aws_ddk_core.pipelines.DataStage","aws_ddk_core.pipelines.EventStage","aws_ddk_core.pipelines.StateMachineStage","aws_ddk_core.resources.DMSFactory","aws_ddk_core.resources.DataBrewFactory","aws_ddk_core.resources.GlueFactory","aws_ddk_core.resources.KMSFactory","aws_ddk_core.resources.KinesisFirehoseFactory","aws_ddk_core.resources.KinesisStreamsFactory","aws_ddk_core.resources.LambdaFactory","aws_ddk_core.resources.S3Factory","aws_ddk_core.resources.SQSFactory","aws_ddk_core.resources.StepFunctionsFactory","aws_ddk_core.stages.AppFlowIngestionStage","aws_ddk_core.stages.AthenaSQLStage","aws_ddk_core.stages.DMSS3ToS3Stage","aws_ddk_core.stages.DataBrewTransformStage","aws_ddk_core.stages.GlueTransformStage","aws_ddk_core.stages.KinesisToS3Stage","aws_ddk_core.stages.S3EventStage","aws_ddk_core.stages.SqsToLambdaStage","AWS DDK API Documentation"],titleterms:{api:28,appflowingestionstag:20,athenasqlstag:21,aw:28,aws_ddk:0,aws_ddk_cor:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],base:[1,2],basestack:2,bootstrap:0,cicd:[1,3],cicdpipelinestack:3,config:[1,4,5],creat:0,data:1,databrewfactori:11,databrewtransformstag:23,datapipelin:6,datastag:7,ddk:[0,28],deploi:0,dmsfactori:10,dmss3tos3stag:22,document:28,eventstag:8,gluefactori:12,gluetransformstag:24,indic:28,init:0,jsonconfigstrategi:5,kinesisfirehosefactori:14,kinesisstreamsfactori:15,kinesistos3stag:25,kmsfactori:13,lambdafactori:16,packag:[0,1,28],pipelin:[1,6,7,8,9],repositori:0,resourc:[1,10,11,12,13,14,15,16,17,18,19],s3eventstag:26,s3factori:17,sqsfactori:18,sqstolambdastag:27,stage:[1,20,21,22,23,24,25,26,27],statemachinestag:9,stepfunctionsfactori:19,tabl:28}})