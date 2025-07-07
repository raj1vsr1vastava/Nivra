import apiClient from './apiClient';
import { societyService } from './societies';
import { residentService } from './residents';
import { financeService } from './finances';
import { userService, roleService, permissionService, societyAdminService } from './settings';

export {
  apiClient,
  societyService,
  residentService,
  financeService,
  userService,
  roleService,
  permissionService,
  societyAdminService
};

export default apiClient;
