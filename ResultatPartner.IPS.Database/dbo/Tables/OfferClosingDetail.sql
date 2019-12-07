CREATE TABLE [dbo].[OfferClosingDetail] (
    [Id]                               INT            IDENTITY (1, 1) NOT NULL,
    [ProspectingCustomerOfferDetailId] INT            NOT NULL,
    [Status]                           INT            NOT NULL,
    [Reason]                           NVARCHAR (MAX) NOT NULL,
    [IsClosed]                         BIT            CONSTRAINT [DF_OfferClosingDetail_IsClosed] DEFAULT ((0)) NOT NULL,
    [ClosedTime]                       DATETIME       NOT NULL,
    [ClosedBy]                         INT            NOT NULL,
    [Possibility]                      INT            NULL,
    [WhatNext]                         NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_OfferClosingDetail] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_OfferClosingDetail_ProspectingCustomerOfferDetail] FOREIGN KEY ([ProspectingCustomerOfferDetailId]) REFERENCES [dbo].[ProspectingCustomerOfferDetail] ([Id])
);

