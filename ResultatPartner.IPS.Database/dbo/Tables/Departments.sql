CREATE TABLE [dbo].[Departments] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (150) NOT NULL,
    [OrganizationId] INT            NULL,
    [Description]    NVARCHAR (MAX) NULL,
    [ManagerId]      INT            NULL,
    [Phone]          NVARCHAR (50)  NULL,
    [Email]          NVARCHAR (50)  NULL,
    [IsActive]       BIT            CONSTRAINT [DF_Departments_IsActive] DEFAULT ((0)) NOT NULL,
    [ParentId]       INT            NULL,
    CONSTRAINT [PK_Department] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Departments_Departments] FOREIGN KEY ([ParentId]) REFERENCES [dbo].[Departments] ([Id]),
    CONSTRAINT [FK_Departments_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]),
    CONSTRAINT [FK_Departments_Users] FOREIGN KEY ([ManagerId]) REFERENCES [dbo].[Users] ([Id])
);

