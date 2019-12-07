CREATE TABLE [dbo].[Packages] (
    [Id]                     INT             IDENTITY (1, 1) NOT NULL,
    [PackageName]            NVARCHAR (50)   NOT NULL,
    [TotalUsers]             INT             NOT NULL,
    [TotalProfileTemplates]  INT             NOT NULL,
    [TotalTrainingTemplates] INT             NOT NULL,
    [TotalProjects]          INT             NOT NULL,
    [Amount]                 DECIMAL (18, 2) NOT NULL,
    [CreatedOn]              DATETIME        NOT NULL,
    [CreatedBy]              INT             NOT NULL,
    [ModifiedOn]             DATETIME        NULL,
    [ModifiedBy]             INT             NULL,
    CONSTRAINT [PK_Packages] PRIMARY KEY CLUSTERED ([Id] ASC)
);

