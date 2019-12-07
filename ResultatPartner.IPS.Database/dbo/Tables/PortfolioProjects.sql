CREATE TABLE [dbo].[PortfolioProjects] (
    [PortfolioProjectID]  INT            IDENTITY (1, 1) NOT NULL,
    [PortfolioCategoryID] INT            NULL,
    [ProjectName]         VARCHAR (1000) NULL,
    [ProjectTitle]        VARCHAR (1000) NULL,
    [ProjectDate]         VARCHAR (1000) NULL,
    [AboutCompany]        VARCHAR (MAX)  NULL,
    [ProjectResult]       VARCHAR (MAX)  NULL,
    [ProjectUrl]          VARCHAR (1000) NULL,
    [isDeleted]           BIT            CONSTRAINT [DF_PortfolioProjects_isDeleted] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_PortfolioProjects] PRIMARY KEY CLUSTERED ([PortfolioProjectID] ASC),
    CONSTRAINT [FK_PortfolioProjects_PortfolioCategory] FOREIGN KEY ([PortfolioCategoryID]) REFERENCES [dbo].[PortfolioCategory] ([PortfolioCategoryID])
);



