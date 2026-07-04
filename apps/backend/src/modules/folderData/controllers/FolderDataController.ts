import { requestToUrl } from '@/utils/requestToUrl';
import type { RequestHandlerTyped } from '@/types/RequestHandlerTyped';
import { FolderDataService } from '../services/FolderDataService';
import { Controller } from '@/shared/Controller';

export class FolderDataController extends Controller {
  private readonly folderDataService: FolderDataService;

  private getFolderData: RequestHandlerTyped<'/folder-data', 'get'> = async (request, response) => {
    const url = requestToUrl(request);

    const path = url.searchParams.get('path') ?? '/';

    const folderData = await this.folderDataService.getFolderData(path);

    return response.send(folderData);
  };

  constructor(parameters: { folderDataService: FolderDataService }) {
    super();

    this.folderDataService = parameters.folderDataService;

    this.router.get('/folder-data', this.getFolderData);
  }
}
