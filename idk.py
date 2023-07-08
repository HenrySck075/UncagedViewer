import os,pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import webbrowser
from shutil import which

def wbopentermux(url,new=0,autoraise=True):
    os.system(url)
def wbopennewtermux(url): wbopentermux(url)

def create_service(client_secret_file:str, api_name, api_version, scope, prefix=''):
    CLIENT_SECRET_FILE = client_secret_file
    API_SERVICE_NAME = api_name
    API_VERSION = api_version
    SCOPES = [f'https://www.googleapis.com/auth/{s}' for s in scope]
	
    #termux instance
    if which("termux-open-url") is not None:
        webbrowser.open = wbopentermux
        webbrowser.open_new = wbopennewtermux
    cred = None
    working_dir = os.getcwd()
    token_dir = 'token files'
    pickle_file = f'token_{API_SERVICE_NAME}_{API_VERSION}{prefix}.pickle'

	### Check if token dir exists first, if not, create the folder
    if not os.path.exists(os.path.join(working_dir, token_dir)):
        os.mkdir(os.path.join(working_dir, token_dir))

    if os.path.exists(os.path.join(working_dir, token_dir, pickle_file)):
        with open(os.path.join(working_dir, token_dir, pickle_file), 'rb') as token:
            cred:Credentials = pickle.load(token)

    if not cred or not cred.valid:
        if cred and cred.expired and cred.refresh_token:
            try: cred.refresh(Request())
            except:
                os.remove(os.path.join(working_dir, token_dir, pickle_file))
                flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
                cred = flow.run_local_server(success_message="done",redirect_uri_trailing_slash=False,termux=True)
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
            cred = flow.run_local_server(success_message="done",redirect_uri_trailing_slash=False,termux=True)

        with open(os.path.join(working_dir, token_dir, pickle_file), 'wb') as token:
            pickle.dump(cred, token)
	
	#return cred.token
    try:
        service = build(API_SERVICE_NAME, API_VERSION, credentials=cred)
        return service #fallback to return the snippetless Resource if the file doesnt exist
    except Exception as e:
        print(e)
        print(f'Failed to create service instance for {API_SERVICE_NAME}')
        os.remove(os.path.join(working_dir, token_dir, pickle_file))
        return None
