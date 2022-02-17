# Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License").
# You may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import json
from abc import ABC, abstractmethod
from functools import lru_cache
from typing import Any, Dict, Optional

from aws_cdk import Environment


class ConfigStrategy(ABC):
    """Abstract class represeting config strategy."""

    @abstractmethod
    def get_config(self, key: str) -> Any:
        """
        Get configuration.

        Parameters
        ----------
        key : str
            Key

        Returns
        -------
        :return: Any
            Config
        """
        pass


class JSONConfigStrategy(ConfigStrategy):
    """
    Read config from ddk.json in the root of the repo.

    Can be used to read from any JSON file by specifying a different path.
    """

    def __init__(
        self,
        path: str = "./ddk.json",
    ) -> None:
        """
        Load the JSON file in the given path.

        Parameters
        ----------
        path : str
            Path to the JSON config, './ddk.json' by default
        """
        self._path = path
        with open(path) as f:
            self._config_file = json.load(f)

    def get_config(self, key: str) -> Any:
        """
        Get config by key.

        Parameters
        ----------
        key : str
            Key

        Returns
        -------
        config : Any
            Dictionary that contains the configuration
        """
        return self._config_file.get(key, {})


class Config:
    """Class used to read configuration with a configurable strategy."""

    def __init__(
        self,
        config_strategy: Optional[ConfigStrategy] = None,
    ) -> None:
        """
        Create Config class instance.

        Provide ConfigStrategy to determine how/where the config should be read from.
        Reads from cdk.json in the root of the repo by default.

        Parameters
        ----------
        config_strategy : Optional[ConfigStrategy]
            Strategy that determines how and where to read config from. JSONConfigStrategy by default
        """
        self._config_strategy = config_strategy or JSONConfigStrategy()

    @lru_cache(maxsize=None)
    def get_env_config(
        self,
        environment_id: str,
    ) -> Dict[str, Any]:
        """
        Get environment config.

        Parameters
        ----------
        environment_id : str
            Identifier of the environment

        Returns
        -------
        env_config : Dict[str, Any]
            Dictionary that contains config for the given environment
        """
        return self._config_strategy.get_config(key="environments").get(environment_id, {})  # type: ignore

    def get_env(
        self,
        environment_id: str,
    ) -> Environment:
        """
        Get environment representing AWS account and region.

        Parameters
        ----------
        environment_id : str
            Identifier of the environment

        Returns
        -------
        env : Environment
            CDK Environment(account, region)
        """
        env_config: Dict[str, Any] = self.get_env_config(environment_id=environment_id)
        return Environment(
            account=env_config.get("account"),
            region=env_config.get("region"),
        )

    def get_resource_config(
        self,
        environment_id: str,
        id: str,
    ) -> Dict[str, Any]:
        """
        Get resource config of the resource with given id in the environment with the given environment id.

        Parameters
        ----------
        environment_id : str
            Identifier of the environment
        id : str
            Identifier of the resource

        Returns
        -------
        config : Dict[str, Any]
            Dictionary that contains config for the given resource in the given environment
        """
        return self.get_env_config(environment_id=environment_id).get("resources", {}).get(id, {})  # type: ignore

    def get_cdk_version(self) -> Optional[str]:
        """
        Return CDK version.

        Returns
        -------
        cdk_version : Optional[str]
            CDK version
        """
        cdk_version: Any = self._config_strategy.get_config(key="cdk_version")
        return cdk_version if isinstance(cdk_version, str) else None

    def get_tags(self) -> Dict[str, str]:
        """
        Return tags.

        Returns
        -------
        tags : Dict[str, str]
            Dict of a form {'tag_key': 'value'}
        """
        return self._config_strategy.get_config(key="tags")  # type: ignore
