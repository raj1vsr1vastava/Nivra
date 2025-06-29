import apiClient from './apiClient';
import { societyService } from './societies';
import { residentService } from './residents';
import { financeService } from './finances';
import { societyFinanceService } from './expenses';
import { userService, roleService, permissionService, societyAdminService } from './settings';

export {
  apiClient,
  societyService,
  residentService,
  financeService,
  societyFinanceService,
  userService,
  roleService,
  permissionService,
  societyAdminService
};

export default apiClient;
