-- Insert Demo Organization
INSERT INTO public.organizations (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Paytm Innovation Lab');

-- Insert Demo User
INSERT INTO public.users (id, organization_id, email, display_name, role, status)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'admin@paytm.com', 'Admin User', 'Admin', 'Active');

-- Insert Teams
INSERT INTO public.teams (id, organization_id, name, functional_vertical, purpose)
VALUES 
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'POS Growth', 'Sales & Business Development', 'Acquire and activate point-of-sale merchants'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Enterprise Partnerships', 'Sales & Business Development', 'Build strategic merchant partnerships'),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'QR Merchant Acquisition', 'Sales & Business Development', 'Grow QR acceptance and activation'),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Merchant Resolution', 'Customer Service', 'Investigate and resolve merchant issues'),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Customer Care', 'Customer Service', 'Handle customer replies and follow-ups'),
('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Reconciliation', 'Finance & Accounting', 'Prepare daily settlement reconciliations'),
('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Merchant Operations', 'Merchant & Business Operations', 'Maintain partner commitments and SLA health'),
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'People Experience', 'Human Resources & Administration', 'Support onboarding and employee journeys');

-- Insert Agents
INSERT INTO public.agents (organization_id, team_id, owner_user_id, name, title, role, status, avatar_skin, avatar_hair, avatar_shirt, role_based_access, context_score, rating, reports_to)
VALUES
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Aarav', 'Sales Manager-AI', 'Sales Manager', 'Online', '#f1c198', '#38291e', '#7057c8', 'Sales CRM · Team pipeline', 94, '4.9', NULL),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Tara', 'Senior Sales Executive-AI', 'Sales Executive', 'Working', '#bf7b55', '#241b1d', '#e38a45', 'Assigned leads · CRM write', 88, '4.8', 'Aarav'),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Kunal', 'Sales Associate-AI', 'Sales Associate', 'Online', '#d79068', '#54311d', '#63a973', 'Assigned leads · Draft only', 76, '4.6', 'Tara'),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Ishita', 'Partnership Manager-AI', 'Partnership Manager', 'Online', '#efbf91', '#532a27', '#5274b8', 'Partner CRM · Contracts read', 91, '4.9', NULL),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Nisha', 'Acquisition Lead-AI', 'Acquisition Lead', 'Online', '#d38861', '#32251f', '#de6e86', 'Merchant CRM · Team data', 89, '4.8', NULL),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Meera', 'Support Manager-AI', 'Support Manager', 'Online', '#c57e55', '#2d2020', '#db7c43', 'Cases · Escalation queue', 92, '4.9', NULL),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'Rohan', 'Customer Associate-AI', 'Customer Associate', 'Working', '#efbe93', '#33221e', '#5b8fc4', 'Assigned tickets · Draft only', 81, '4.7', NULL),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'Kabir', 'Finance Manager-AI', 'Finance Manager', 'Online', '#9f644a', '#1b1a1e', '#44937b', 'Finance ledger · Read only', 95, '4.9', NULL),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', 'Pooja', 'Operations Lead-AI', 'Operations Lead', 'Working', '#efbd91', '#20272b', '#4285aa', 'SLA board · Partner data', 90, '4.8', NULL),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', 'Anaya', 'People Manager-AI', 'People Manager', 'Online', '#b96f51', '#412727', '#c35d81', 'HRIS · Restricted team data', 87, '4.8', NULL);
