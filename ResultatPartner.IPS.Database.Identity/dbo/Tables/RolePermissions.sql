CREATE TABLE [dbo].[RolePermissions] (
    [Id]                         INT            IDENTITY (1, 1) NOT NULL,
    [RoleId]                     NVARCHAR (128) NOT NULL,
    [ResourceId]                 INT            NOT NULL,
    [Operations]                 INT            NOT NULL,
    [IsApplicableToOwnResources] BIT            CONSTRAINT [DF_RolePermissions_IsApplicableToOwnResources] DEFAULT ((1)) NOT NULL,
    [IsApplicableToAllResources] BIT            CONSTRAINT [DF_RolePermissions_IsApplicableToAllResources] DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_Permissions] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_RolePermissions_AspNetRoles] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[AspNetRoles] ([Id]),
    CONSTRAINT [FK_RolePermissions_Resources] FOREIGN KEY ([ResourceId]) REFERENCES [dbo].[Resources] ([Id])
);



