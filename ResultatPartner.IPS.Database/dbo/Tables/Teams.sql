CREATE TABLE [dbo].[Teams] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (250) NULL,
    [DepartmentId]   INT            NULL,
    [OrganizationId] INT            NULL,
    [Description]    NVARCHAR (MAX) NULL,
    [TeamLeadId]     INT            NULL,
    [Phone]          NVARCHAR (50)  NULL,
    [Email]          NVARCHAR (50)  NULL,
    [IsActive]       BIT            CONSTRAINT [DF_Teams_IsActive] DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_Teams] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Teams_Departments] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Departments] ([Id]),
    CONSTRAINT [FK_Teams_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]),
    CONSTRAINT [FK_Teams_Users] FOREIGN KEY ([TeamLeadId]) REFERENCES [dbo].[Users] ([Id])
);

