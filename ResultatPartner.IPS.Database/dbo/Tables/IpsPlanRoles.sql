CREATE TABLE [dbo].[IpsPlanRoles] (
    [PlanRoleID]        INT IDENTITY (1, 1) NOT NULL,
    [PlanID]            INT NULL,
    [RoleID]            INT NULL,
    [NoOfPersonAllowed] INT CONSTRAINT [DF_IpsPlanRoles_NoOfPersonAllowed] DEFAULT ((0)) NULL,
    [IsDeleted]         BIT CONSTRAINT [DF_IpsPlanRoles_IsDeleted] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_IpsPlanRoles] PRIMARY KEY CLUSTERED ([PlanRoleID] ASC),
    CONSTRAINT [FK_IpsPlanRoles_IpsPlans] FOREIGN KEY ([PlanID]) REFERENCES [dbo].[IpsPlans] ([PlanID]),
    CONSTRAINT [FK_IpsPlanRoles_LookupItems] FOREIGN KEY ([RoleID]) REFERENCES [dbo].[LookupItems] ([Id])
);

