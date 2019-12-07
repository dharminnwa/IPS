CREATE TABLE [dbo].[TaskScales] (
    [Id]             INT             IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (250)  NOT NULL,
    [Description]    NVARCHAR (1000) NULL,
    [OrganizationId] INT             NULL,
    [DepartmentId]   INT             NULL,
    [TeamId]         INT             NULL,
    [UserId]         INT             NULL,
    [ScaleStart]     INT             CONSTRAINT [DF_TaskScales_ScaleStart] DEFAULT ((0)) NOT NULL,
    [ScaleEnd]       INT             CONSTRAINT [DF_TaskScales_ScaleEnd] DEFAULT ((0)) NOT NULL,
    [ScaleInterval]  INT             CONSTRAINT [DF_TaskScales_ScaleInterval] DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_TaskScales] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TaskScales_Departments] FOREIGN KEY ([DepartmentId]) REFERENCES [dbo].[Departments] ([Id]),
    CONSTRAINT [FK_TaskScales_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]),
    CONSTRAINT [FK_TaskScales_Teams] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]),
    CONSTRAINT [FK_TaskScales_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);





