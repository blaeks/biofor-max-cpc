// date:     14.08.2022.
// version:  0.8.1m

// NEW Features
// TopOfPage - Overkil MEASUREMENT
// Number of Changes - MEASUREMENT
// Flexible DURING filter in AdsApp.report
// OLD Average Overkill - (targeting TopOfPage and avgTopOfPage as a fallback)
// FRESH Average Overkill - (targeting TopOfPage and avgTopOfPage as a fallback)
// Count of UP & DOWN Changes
// MEDIAN values added (!) - (mindfully and carefullytargeting FirstPageMedian, TopOfPageMedian, FirstPositionMedian in obscure environments with no estimates)

// TODO: Focus on prices - manually re-calculate the values, match, double check - SELF-define GOALS - make the CONNECTION with COST COST COST AND CONV VALUE(!)
// NEW TODO: fork this to TopOfPage-FORK ! (hmmm)
// MAIN TODO - IMPORT COST/CONV into the equation

// BUG(!) - looks like some keywords are re-calculated multiple times (!)
//    |-->> update here - it's because of the ClickType granulation - SOLUTION IDEA - switch case OR forEeach() (?!)

/*
 * Set CPC based on blaeks' formula.
 * 
 * 
**/

function main() {

    var HARD_LIMIT = 66.66;
    var LOW_LIMIT = 1.47;

    var campaignNameOriginal = "00_Seaerch_Focus";
    var campaignNameExperiment = "00_Seaerch_Focus";
    var labelaOriginal = "";
    var labelaExperiment = "";

    var labelaIdOriginal = getLabelsByName(labelaOriginal);
    var labelaIdExperiment = getLabelsByName(labelaExperiment);

    Logger.log('labelaIdOriginal: ' + labelaIdOriginal);
    Logger.log('labelaIdExperiment: ' + labelaIdExperiment);

    var rows = getKeywordReport(campaignNameOriginal, labelaIdOriginal);

    var numberOfKeywordsFirstPageCpc = 0;
    var numberOfKeywordsTopOfPageCpc = 0;
    var numberOfKeywordsFirstPositionCpc = 0;

    var avgFirstPageCpc = 0.0;
    var avgTopOfPageCpc = 0.0;
    var avgFirstPositionCpc = 0.0;

    var FirstPositionMedian = 0.0;
    var TopOfPageMedian = 0.0;
    var FirstPageMedian = 0.0;
    var AverageCpcMedian = 0.0;

    var FirstPageArray = new Array();
    var TopOfPageArray = new Array();
    var FirstPositionArray = new Array();
    var AverageCpcArray = new Array();

    var maxAvgCPC = 0;
    var brojach = 0;
    var i = 0;
    var labelaId = 0;

    var diff = 0;
    var Down = 0;
    var Up = 0;
    var noCH = 0;

    while (rows.hasNext()) {
        var row = rows.next();
            i = i + 1;
        var avgCPC = StingToFloat(row["AverageCpc"]);
        var maxCPC = StingToFloat(row["CpcBid"]);

        var FirstPageCpc = StingToFloat(row["FirstPageCpc"]);
        var TopOfPageCpc = StingToFloat(row["TopOfPageCpc"]);
        var FirstPositionCpc = StingToFloat(row["FirstPositionCpc"]);

        var ClickTypeCalc = String(row["ClickType"]);

        if (FirstPageCpc > 0) {
          avgFirstPageCpc = avgFirstPageCpc + FirstPageCpc;
          numberOfKeywordsFirstPageCpc = numberOfKeywordsFirstPageCpc + 1;
          FirstPageArray.push(FirstPageCpc);
        }

        if (TopOfPageCpc > 0) {
          avgTopOfPageCpc = avgTopOfPageCpc + TopOfPageCpc;
          numberOfKeywordsTopOfPageCpc = numberOfKeywordsTopOfPageCpc + 1;
          TopOfPageArray.push(TopOfPageCpc);
        }

        if (FirstPositionCpc > 0) {
          avgFirstPositionCpc = avgFirstPositionCpc + FirstPositionCpc;
          numberOfKeywordsFirstPositionCpc = numberOfKeywordsFirstPositionCpc + 1;
          FirstPositionArray.push(FirstPositionCpc);
        }

        if (avgCPC > 0) {
          AverageCpcArray.push(avgCPC);
        }

        maxAvgCPC = Math.max(row["AverageCpc"], maxAvgCPC);
        Logger.log("WATCH maxAvgCPC GROW: %s", maxAvgCPC);

        //Logger.log('FirstPageCpc: %s     , TopOfPageCpc: %s     , FirstPosCpc: %s     , FRESHMax.CPC: %s     , AverageCPC: %s     , currMAXcpc: %s     , MatchType: %s, ClickTypeCalc: %s, keyword: %s', row["FirstPageCpc"], row["TopOfPageCpc"], row["FirstPositionCpc"], maxCPC, avgCPC, maxAvgCPC, row["KeywordMatchType"], ClickTypeCalc, row["Criteria"]);
        Logger.log("type of FirstPageArray POST ARRAY: %s", typeof FirstPageArray);
        Logger.log("type of TopOfPageArray POST ARRAY: %s", typeof TopOfPageArray);
        Logger.log("type of FirstPositionArray POST ARRAY: %s", typeof FirstPositionArray);
    }

    Logger.log("FirstPageArray: %s", FirstPageArray);
    Logger.log("TopOfPageArray: %s", TopOfPageArray);
    Logger.log("FirstPositionArray: %s", FirstPositionArray);
    Logger.log("AverageCpcArray: %s", AverageCpcArray);

    avgFirstPageCpc = avgFirstPageCpc/numberOfKeywordsFirstPageCpc;
    avgTopOfPageCpc = avgTopOfPageCpc/numberOfKeywordsTopOfPageCpc;
    avgFirstPositionCpc = avgFirstPositionCpc/numberOfKeywordsFirstPositionCpc;

    FirstPageMedian = median(FirstPageArray);
    TopOfPageMedian = median(TopOfPageArray);
    FirstPositionMedian = median(FirstPositionArray);
    AverageCpcMedian = median(AverageCpcArray);
    Logger.log("AverageCpcMedian: %s, FirstPageMedian: %s, TopOfPageMedian: %s, FirstPositionMedian: %s", AverageCpcMedian, FirstPageMedian, TopOfPageMedian, FirstPositionMedian);

    var nokFirstPageCpc = numberOfKeywordsFirstPageCpc;
    var nokTopOfPageCpc = numberOfKeywordsTopOfPageCpc;
    var nokFirstPositionCpc = numberOfKeywordsFirstPositionCpc;

    var rows = getKeywordReport(campaignNameExperiment, labelaIdExperiment);
    var FreshOVK = 0;
    var OldOVK = 0;
    var FreshOVKsumm = 0;
    var OldOVKsumm = 0;
    var avgFreshOVK = 0;
    var avgOldOVK = 0;

    var FreshMaxCPCsumm = 0;
    var Old_maxCPCsumm = 0;
    var avgFreshMaxCPC = 0;
    var avgOld_maxCPC = 0;
    var br_promena = 0;

    while (rows.hasNext()) {
        var row = rows.next();

        var AverageCpc = parseFloat(row["AverageCpc"]);
        var maxCPC = parseFloat(row["CpcBid"]);
        var InitialCpc = parseFloat(row["CpcBid"]);

        var FirstPageCpc = parseFloat(row["FirstPageCpc"]);
        var TopOfPageCpc = parseFloat(row["TopOfPageCpc"]);
        var FirstPositionCpc = parseFloat(row["FirstPositionCpc"]);

        var ActiveConversions = parseFloat(row["Conversions"]);
        var ClickType = String(row["ClickType"]);
        var keywordId = String(row["Id"]);
        var adgroupId = String(row["AdGroupId"]);
        // Logger.log('InitialCpc: %s, rowConversions: %s, ActiveConversions: %s, ClickType: %s, maxAvgCPC: %s, keywordId: %s, adgroupId: %s', InitialCpc, row["Conversions"], ActiveConversions, ClickType, maxAvgCPC,  keywordId, adgroupId);

        if (FirstPageCpc > 0 && ActiveConversions < 0.1) {
          switch (ClickType) {
              case 'Headline':
                var H12 = (AverageCpc>avgTopOfPageCpc ? AverageCpc+(AverageCpc/21) : TopOfPageCpc+(avgFirstPageCpc/13));
                var G12 = (H12<avgTopOfPageCpc ? AverageCpc+(FirstPageCpc/9) : H12);
                var MaxCPC = (G12>avgFirstPositionCpc ? G12 : avgFirstPositionCpc+(TopOfPageCpc/21));
                Logger.log('NO_Conv_WH_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, MaxCPC, H12, keywordId, adgroupId);
                break;
              case 'Sitelink':
                var H12C = (AverageCpc>avgTopOfPageCpc ? AverageCpc+(AverageCpc/13) : TopOfPageCpc+(TopOfPageCpc/9));
                var G12C = (H12<avgTopOfPageCpc ? AverageCpc+(FirstPageCpc/9) : H12C);
                var MaxCPC = (G12C>avgFirstPositionCpc ? AverageCpc+(TopOfPageCpc/3) : G12C);
                Logger.log('NO_Conv_WH_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, MaxCPC, H12C, keywordId, adgroupId);
                break;
              case 'Image extension':
                var H12C = (AverageCpc>avgTopOfPageCpc ? AverageCpc+(AverageCpc/13) : TopOfPageCpc+(TopOfPageCpc/21));
                var G12C = (H12<avgTopOfPageCpc ? TopOfPageCpc+(FirstPageCpc/9) : H12C);
                var MaxCPC = (G12C<FirstPositionCpc ? FirstPositionCpc+(FirstPositionCpc/21) : G12C);
                Logger.log('NO_Conv_WH_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, MaxCPC, H12C, keywordId, adgroupId);
                break;
              default:
                //Logger.log('NO_Conv_WH_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, H12, MaxCPC, keywordId, adgroupId);
            }
        }
        else if (FirstPageCpc > 0 && ActiveConversions >= 0.1) {
          switch (ClickType) {
            case 'Headline':
              var H12C = (AverageCpc>avgTopOfPageCpc ? AverageCpc+(AverageCpc/11) : TopOfPageCpc+(TopOfPageCpc/9));
              var G12C = (H12<avgTopOfPageCpc ? AverageCpc+(FirstPageCpc/9) : H12C);
              var MaxCPC = (G12C>avgFirstPositionCpc ? AverageCpc+(TopOfPageCpc/2) : G12C);
              Logger.log('WH_Conv_WH_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, MaxCPC, H12C, keywordId, adgroupId);
              break;
            case 'Sitelink':
              var H12C = (AverageCpc>avgTopOfPageCpc ? AverageCpc+(AverageCpc/13) : TopOfPageCpc+(TopOfPageCpc/9));
              var G12C = (H12<avgTopOfPageCpc ? AverageCpc+(FirstPageCpc/9) : H12C);
              var MaxCPC = (G12C>avgFirstPositionCpc ? AverageCpc+(TopOfPageCpc/3) : G12C);
              Logger.log('WH_Conv_WH_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, MaxCPC, H12C, keywordId, adgroupId);
              break;
            case 'Image extension':
              var H12C = (AverageCpc>avgTopOfPageCpc ? AverageCpc+(AverageCpc/13) : TopOfPageCpc+(TopOfPageCpc/21));
              var G12C = (H12<avgTopOfPageCpc ? TopOfPageCpc+(FirstPageCpc/9) : H12C);
              var MaxCPC = (G12C<FirstPositionCpc ? FirstPositionCpc+(FirstPositionCpc/21) : G12C);
              Logger.log('WH_Conv_WH_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, MaxCPC, H12C, keywordId, adgroupId);
              break;
            default:
              //Logger.log('WH_Conv_WH_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, H12, MaxCPC, keywordId, adgroupId);
          }
        }
        else if (FirstPageCpc < 0 && ActiveConversions < 0.1) {
          switch (ClickType) {
            case 'Headline':
              var H12 = (AverageCpc>avgTopOfPageCpc ? AverageCpc+(AverageCpc/21) : TopOfPageMedian+(avgFirstPageCpc/13));
              var G12 = (H12<avgTopOfPageCpc ? AverageCpc+(TopOfPageMedian/9) : H12);
              var MaxCPC = (G12>FirstPositionMedian ? G12 : FirstPositionMedian+(TopOfPageMedian/21));
              Logger.log('NO_Conv_NO_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, MaxCPC, H12, keywordId, adgroupId);
              break;
            case 'Sitelink':
              var H12C = (AverageCpc>avgTopOfPageCpc ? AverageCpc+(AverageCpc/13) : TopOfPageMedian+(TopOfPageMedian/9));
              var G12C = (H12<avgTopOfPageCpc ? AverageCpc+(FirstPageMedian/9) : H12C);
              var MaxCPC = (G12C>avgFirstPositionCpc ? AverageCpc+(TopOfPageMedian/3) : G12C);
              Logger.log('NO_Conv_NO_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, MaxCPC, H12C, keywordId, adgroupId);
              break;
            case 'Image extension':
              var H12C = (AverageCpc>avgTopOfPageCpc ? AverageCpc+(AverageCpc/13) : TopOfPageMedian+(TopOfPageMedian/21));
              var G12C = (H12<avgTopOfPageCpc ? TopOfPageMedian+(FirstPageMedian/9) : H12C);
              var MaxCPC = (G12C<avgFirstPositionCpc ? FirstPositionMedian+(FirstPositionMedian/21) : G12C);
              Logger.log('NO_Conv_NO_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, MaxCPC, H12C, keywordId, adgroupId);
              break;
            default:
              //Logger.log('NO_Conv_NO_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, H12, MaxCPC, keywordId, adgroupId);
          }
        }
        else if  (FirstPageCpc < 0 && ActiveConversions >= 0.1) {
          switch (ClickType) {
            case 'Headline':
              var H12C = (AverageCpc>avgTopOfPageCpc ? AverageCpc+(AverageCpc/11) : TopOfPageMedian+(TopOfPageMedian/9));
              var G12C = (H12<avgTopOfPageCpc ? AverageCpc+(FirstPageMedian/9) : H12C);
              var MaxCPC = (G12C>avgFirstPositionCpc ?  AverageCpc+(TopOfPageMedian/2) : G12C);
              Logger.log('WH_Conv_NO_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12C: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, MaxCPC, H12C, keywordId, adgroupId);
              break;
            case 'Sitelink':
              var H12C = (AverageCpc>avgTopOfPageCpc ? AverageCpc+(AverageCpc/13) : TopOfPageMedian+(TopOfPageMedian/9));
              var G12C = (H12<avgTopOfPageCpc ? AverageCpc+(FirstPageMedian/9) : H12C);
              var MaxCPC = (G12C>avgFirstPositionCpc ? AverageCpc+(TopOfPageMedian/3) : G12C);
              Logger.log('WH_Conv_NO_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12C: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, MaxCPC, H12C, keywordId, adgroupId);
              break;
            case 'Image extension':
              var H12C = (AverageCpc>avgTopOfPageCpc ? AverageCpc+(AverageCpc/13) : TopOfPageMedian+(TopOfPageMedian/21));
              var G12C = (H12<avgTopOfPageCpc ? TopOfPageMedian+(FirstPageMedian/9) : H12C);
              var MaxCPC = (G12C<avgFirstPositionCpc ? avgFirstPositionCpc+(FirstPositionMedian/21) : G12C);
              Logger.log('WH_Conv_NO_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12C: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, MaxCPC, H12C, keywordId, adgroupId);
              break;
            default:
              //Logger.log('WH_Conv_NO_FirstPageCpc: %s, AverageCpc: %s, avgFirstPositionCpc: %s, avgTopOfPageCpc: %s, TopOfPageCpc: %s, OLDMaxCPC: %s, MaxCPC: %s, H12: %s, keywordId: %s, adgroupId: %s', ClickType, AverageCpc, avgFirstPositionCpc, avgTopOfPageCpc, TopOfPageCpc, maxCPC, H12, MaxCPC, keywordId, adgroupId);
          }
        } else {
            Logger.log('Uppssss')
        }

        if (MaxCPC > HARD_LIMIT) {
            MaxCPC = HARD_LIMIT;
        }

        if (MaxCPC < LOW_LIMIT) {
            MaxCPC = (LOW_LIMIT + (AverageCpcMedian/13));
        }

        diff = (MaxCPC - InitialCpc);

        if (diff > 0.01) {
            Up = Up + 1;
            var promena = "+";
            br_promena = br_promena + 1;
        } else if (diff < -0.01) {
            Down = Down + 1;
            var promena = "-";
            br_promena = br_promena + 1;
        } else {
            noCH = noCH + 1;
            var promena = " ";
        }
        //Logger.log('FirstPageCpc: %s, TopOfPageCpc: %s,      FRESH Max.CPC: %s     ,       OLD Max. CPC: %s     , maxAvgCPC %s, Match Type: %s, KW id: %s, KW:%s', row["FirstPageCpc"], row["TopOfPageCpc"], maxCPC, row["CpcBid"], maxAvgCPC, row["KeywordMatchType"], row["Id"], row["Criteria"]);
        if (TopOfPageCpc == 0) {
          OldOVK = ((maxCPC*100) / avgTopOfPageCpc);
          //Logger.log('OldOVK: %s, maxCPC: %s, ZERO-TopOfPageCpc: %s', OldOVK, maxCPC, TopOfPageCpc);
          FreshOVK = ((MaxCPC*100) / avgTopOfPageCpc);
          //Logger.log('N-estTopOfPageCPC_plus_totals: %s, OLD_MaxCPC: %s  ch-direction: %s  FreshOverKill: %s, FRESH_MaxCPC: %s, FirstPageCpc: %s, H12C: %s, G12C: %s, KW:%s, ClickType: %s, ID:%s, Match: %s, AdGroup: %s, avgTopOfPageCpc: %s, maxAvgCPC: %s',
                     //brojach, row["CpcBid"], promena, FreshOVK, MaxCPC, row["FirstPageCpc"], H12C, G12C, ClickType, row["Criteria"], row["Id"], row["KeywordMatchType"], row["AdGroupName"], avgTopOfPageCpc, maxAvgCPC);
          Logger.log('NO-estTopOfPageCPC_plus_totals: %s, OLD_Overkill: %s, FRESH_OverKill: %s, TopOfPageCPC: %s,  ch-direction: %s  OLD_MaxCPC: %s, FRESH_MaxCPC: %s, avgTopOfPageCpc: %s, ClickType: %s, maxAvgCPC: %s, H12C: %s, G12C: %s, KW:%s, ID:%s, Match: %s, AdGroup: %s',
                     brojach, OldOVK, FreshOVK, row["TopOfPageCpc"], promena, row["CpcBid"], MaxCPC, avgTopOfPageCpc, ClickType, maxAvgCPC, H12C, G12C, row["Criteria"], row["Id"], row["KeywordMatchType"], row["AdGroupName"]);
        } else {
          OldOVK = ((maxCPC*100) / TopOfPageCpc);
          //Logger.log('OldOVK: %s, maxCPC: %s, NOzr-TopOfPageCpc: %s', OldOVK, maxCPC, TopOfPageCpc);
          FreshOVK = ((MaxCPC*100) / TopOfPageCpc);
          Logger.log('w-estTopOfPageCPC_plus_totals: %s, OLD_Overkill: %s, FRESH_OverKill: %s, TopOfPageCPC: %s,  ch-direction: %s  OLD_MaxCPC: %s, FRESH_MaxCPC: %s, avgTopOfPageCpc: %s, ClickType: %s, maxAvgCPC: %s, H12C: %s, G12C: %s, KW:%s, ID:%s, Match: %s, AdGroup: %s',
                     brojach, OldOVK, FreshOVK, row["TopOfPageCpc"], promena, row["CpcBid"], MaxCPC, avgTopOfPageCpc, ClickType, maxAvgCPC, H12C, G12C, row["Criteria"], row["Id"], row["KeywordMatchType"], row["AdGroupName"]);
        }
        OldOVKsumm = OldOVKsumm + OldOVK;
        FreshOVKsumm = FreshOVKsumm + FreshOVK;
        Old_maxCPCsumm = Old_maxCPCsumm + maxCPC;
        FreshMaxCPCsumm = FreshMaxCPCsumm + MaxCPC;

        avgOldOVK = (OldOVKsumm/brojach);
        avgFreshOVK = (FreshOVKsumm/brojach);
        avgOld_maxCPC = (Old_maxCPCsumm/brojach);
        avgFreshMaxCPC = (FreshMaxCPCsumm/brojach);

        // Id 3000000 is reserved for automated bidding (dynamic adgroup type)
        // and does not have .bidding().setCpc() so we filter it out.
        // https://developers.google.com/adwords/api/docs/appendix/reports/keywords-performance-report - second paragraph
        if (row["Id"] != 3000000) {
            var keywordSelector = AdsApp.keywords()
                .withIds([[row["AdGroupId"] , row["Id"]]])
                .get()
                .next();
            //Logger.log('KW_ID: %s, estTopOfPageCpc: %s, estFirstPageCpc: %s', keywordId, TopOfPageCpc, FirstPageCpc)
            keywordSelector.bidding().setCpc(MaxCPC);
            brojach = brojach + 1;
        }
    }
    Logger.log('TotalKWsProcessed: %s, total_Changes: %s, UP_changes: %s, DOWN_changes: %s, avgFRESH_OVK: %s, avgOLD_OVK: %s, avgFreshMaxCPC: %s, avgOld_maxCPC: %s, MaxCPC: %s, FreshOVKsumm: %s', brojach, br_promena, Up, Down, avgFreshOVK, avgOldOVK, avgFreshMaxCPC, avgOld_maxCPC, MaxCPC, FreshOVKsumm);
}

/*
 *  Function to get list of keywords matching label name, campaign and status.
 * 
**/
function getKeywordReport(campaignName1, labelaId1) {
    // Take care if labela1 is empty and not used
    var labelaSearch = "";
    if (labelaId1 != 0) {
        var labelaSearch = 'AND LabelIds CONTAINS_ANY [' + labelaId1 + '] ';
    } else {
        var labelaSearch = ' ';
    }

    var report = AdsApp.report(
        'SELECT AdGroupId, Id, CampaignName, AdGroupName, KeywordMatchType, Criteria, CpcBid, AverageCpc, FirstPositionCpc, TopOfPageCpc, FirstPageCpc, ClickType, Cost, Conversions, Impressions, Clicks, Ctr, QualityScore, FinalUrls, FinalMobileUrls, Labels, LabelIds, Status ' +
        'FROM   KEYWORDS_PERFORMANCE_REPORT ' +
        'WHERE  Status = "ENABLED" ' +
        //'WHERE  Impressions >= 0 ' +
        //'AND  FirstPageCpc >= 0 ' +
        //'AND Conversions > 0.1 ' +
        //'AND FirstPageCpc > 0 ' +
        //'WHERE AdGroupStatus = "ENABLED" ' +
        labelaSearch + 
        'AND CampaignName = "' + campaignName1 + '" ' +
        //'AND CampaignName = "' + campaignName1 + '" ');
        //"DURING LAST_7_DAYS");
        "DURING 20210301,20220813");
        //"DURING YESTERDAY");

    //var spreadsheet = SpreadsheetApp.create("phsOFF_00_NZ_Search_05.gs");
    //report.exportToSheet(spreadsheet.getActiveSheet());
    //Logger.log("Report available at " + spreadsheet.getUrl());

    var rows = report.rows();
    return rows;
}

/*
 *  Function to get labelId from Label Name
 *  LabelId is used in AWQL query in function getKeywordReport()
**/
function getLabelsByName(labela1) {
    // Take care if labela1 is empty and not used
    if (labela1 == "") {
        return 0;
    }

    var labelIterator = AdsApp.labels()
        .withCondition('Name = "' + labela1 + '"')
        .get()
        .next();

    return labelIterator.getId();
    Logger.log('getId: ' + labelIterator.getId());
}

/*
* Function to convert string to float
*
*/
function StingToFloat(r) {
    r = r.replace("<", "");
    r = r.replace(">", "");
    r = r.replace("%", "");
    r = r.replace("--","");

    if (isNaN(parseFloat(r))) {
        return 0;
    }

    return parseFloat(r);
}

/*
* Funciton to get median value
*
*/
function median(values) {
    if (values.length === 0) throw new Error("No inputs");
    values.sort(function(a,b){
      return a-b;
    });

    var half = Math.floor(values.length / 2);

    if (values.length % 2)
      return values[half];
    return (values[half - 1] + values[half]) / 2.0;
}

/*
* Function to create array from the row
*
*/
function array () {
    //Array.push();
    //return Array;

    //niz = niz.push(arg);
    //return arg.push(arg);
    //return Array.from(arg);
    //return Array.from(arguments);
    //return Array();
    return Array.prototype.push();
}
