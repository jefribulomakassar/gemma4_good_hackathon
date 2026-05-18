{showDriveExplorer && (
  <GoogleDriveAgent onClose={() => setShowDriveExplorer(false)} language={activeLangRef.current === 'id' ? 'Indonesia' : 'English'}
      onInsight={(text, url, title) => {
        sendMessage(Berikut struktur folder Google Drive "${title}":\n\n${text}, true)
        setShowDriveExplorer(false)
      }}
  />
)}