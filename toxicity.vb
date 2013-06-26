
Private Sub ConvertButton_Click()
    xmlFilename = Application.GetOpenFilename("XML Files (*.xml), *.xml")
    If xmlFilename <> False Then
        Dim result As XlXmlImportResult
        result = ActiveWorkbook.XmlMaps("checkstyle_Map").Import(xmlFilename, True)
        
        If result = xlXmlImportSuccess Then
            For Each n In Worksheets("Data").Range("InputData")
                If (Not IsEmpty(n.Value)) Then
                    newValue = Empty
                    If (n.Column = 4) Then
                        newValue = CalculateScore(n.Value)
                    ElseIf (n.Column = 5) Then
                        newValue = FormatMessageSource(n.Value)
                    ElseIf (n.Column = 6) Then
                        newValue = ExtractClassName(n.Value)
                    End If
                    If (Not IsEmpty(newValue)) Then
                        n.Value = newValue
                    End If
                End If
            Next n
            
            Worksheets("AggregateData").PivotTables(1).RefreshTable
        Else
            MsgBox ("XML import failed.")
        End If
    End If
End Sub

Function CalculateScore(n As String) As Variant
    If (n = "score") Then
        CalculateScore = n
    Else
        Dim values(0 To 2) As Integer
        values(0) = -1
        values(1) = -1
        delim = " "
        msg = n & delim
        While (InStr(msg, delim) > 0)
            word = Left(msg, InStr(msg, delim) - 1)
            msg = Mid(msg, InStr(msg, delim) + 1)
            If (InStr(word, ")")) Then
                word = Left(word, InStr(word, ")") - 1)
            End If
            If (IsNumeric(word)) Then
                If (values(0) = -1) Then
                    values(0) = word
                Else
                    values(1) = word
                End If
            End If
        Wend
        If (values(0) > 0 And values(1) > 0) Then
            CalculateScore = values(0) / values(1)
        Else
            CalculateScore = 1
        End If
    End If
End Function

Function FormatMessageSource(n As String) As String
    words = Split(n, ".")
    msgsource = words(UBound(words))
    If (InStr(msgsource, "Check")) Then
        msgsource = Left(msgsource, InStr(msgsource, "Check") - 1)
    End If
    FormatMessageSource = msgsource
End Function

Function ExtractClassName(n As String) As String
    n = Replace(n, "\", "/")
    words = Split(n, "/")
    ExtractClassName = Replace(words(UBound(words)), ".java", "")
End Function

Private Sub Worksheet_SelectionChange(ByVal Target As Range)

End Sub
