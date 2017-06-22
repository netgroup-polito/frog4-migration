from exception import WrongConfigurationFile
import configparser

class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]

class Configuration(object, metaclass=Singleton):

    def __init__(self):
        self.conf_file = "config/default-config.ini"

        self.inizialize()

    def inizialize(self):

        configParser = configparser.SafeConfigParser()
        configParser.read(self.conf_file)

        try:

            self._GLOBAL_ORCH_URL = configParser.get('global-orchestrator','global_orch_endpoint')
            self._CONFIGURATION_ORCH_URL = configParser.get('configuration-orchestrator','config_orch_endpoint')

            self._DEBUG = configParser.get('execution', 'debug')

            self._USERNAME = configParser.get('debug-info','username')
            self._PASSWORD = configParser.get('debug-info','password')

            self._GRAPHS_PATH = configParser.get('graphs','graphs_path')

            self._FROM_VNF_ID = configParser.get('migration','from_vnf_id')
            self._TO_VNF_ID = configParser.get('migration','to_vnf_id')


        except Exception as ex:
            raise WrongConfigurationFile(str(ex))


    @property
    def GLOBAL_ORCH_URL(self):
        return self._GLOBAL_ORCH_URL

    @property
    def CONFIGURATION_ORCH_URL(self):
        return self._CONFIGURATION_ORCH_URL

    @property
    def DEBUG(self):
        return self._DEBUG

    @property
    def USERNAME(self):
        return self._USERNAME

    @property
    def PASSWORD(self):
        return self._PASSWORD

    @property
    def GRAPHS_PATH(self):
        return self._GRAPHS_PATH

    @property
    def FROM_VNF_ID(self):
        return self._FROM_VNF_ID

    @property
    def TO_VNF_ID(self):
        return self._TO_VNF_ID
