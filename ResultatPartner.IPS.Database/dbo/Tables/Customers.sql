CREATE TABLE [dbo].[Customers] (
    [Id]             INT           IDENTITY (1, 1) NOT NULL,
    [OrganizationId] INT           NULL,
    [Name]           NVARCHAR (50) NOT NULL,
    [Email]          VARCHAR (100) NULL,
    [Mobile]         VARCHAR (12)  NOT NULL,
    [PostCode]       VARCHAR (10)  NULL,
    [CreatedOn]      DATETIME      NULL,
    [CreatedBy]      INT           NULL,
    [ModifiedOn]     DATETIME      NULL,
    [ModifiedBy]     INT           NULL,
    [AssignedUserId] INT           NULL,
    [CSVFile]        NVARCHAR (50) NULL,
    CONSTRAINT [PK_Customers] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Customers_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]),
    CONSTRAINT [FK_Customers_Users] FOREIGN KEY ([AssignedUserId]) REFERENCES [dbo].[Users] ([Id])
);











