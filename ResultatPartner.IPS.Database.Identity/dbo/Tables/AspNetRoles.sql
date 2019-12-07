CREATE TABLE [dbo].[AspNetRoles] (
    [Id]             NVARCHAR (128) NOT NULL,
    [Name]           NVARCHAR (256) NOT NULL,
    [RoleLevel]      INT            CONSTRAINT [DF_AspNetRoles_RoleLevel] DEFAULT ((1)) NOT NULL,
    [OrganizationId] INT            NULL,
    [Discriminator]  NVARCHAR (128) NULL,
    CONSTRAINT [PK_dbo.AspNetRoles] PRIMARY KEY CLUSTERED ([Id] ASC)
);




GO


