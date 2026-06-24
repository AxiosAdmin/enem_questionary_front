import {
  IMAGE_SOURCE_OPTIONS,
  MATERIAL_POSITION_OPTIONS,
  formatMaterialTypeLabel,
} from "../helpers/supportMaterials";

const SupportMaterialsEditor = ({
  supportMaterials,
  onAddSupportMaterial,
  onMoveSupportMaterial,
  onRemoveSupportMaterial,
  onUpdateSupportMaterial,
  submissionHint = "question",
}) => (
  <div className="question-form-section">
    <div className="screen-header screen-header--compact">
      <h2>Materiais de apoio</h2>
      <p>
        {submissionHint === "endpoint" ? (
          <>
            Adicione quantos materiais quiser. Cada item sera enviado individualmente no
            endpoint <strong> /support-materials</strong>.
          </>
        ) : (
          <>
            Adicione quantos materiais quiser. Cada item sera enviado em
            <strong> support_materials</strong> com o formato esperado pela rota.
          </>
        )}
      </p>
    </div>

    <div className="toolbar">
      <button
        type="button"
        className="secondary-button"
        onClick={() => onAddSupportMaterial("text")}
      >
        Adicionar texto
      </button>
      <button
        type="button"
        className="secondary-button"
        onClick={() => onAddSupportMaterial("table")}
      >
        Adicionar tabela
      </button>
      <button
        type="button"
        className="secondary-button"
        onClick={() => onAddSupportMaterial("image")}
      >
        Adicionar imagem
      </button>
    </div>

    {supportMaterials.length ? (
      <div className="question-form-section">
        {supportMaterials.map((material, materialIndex) => (
          <div key={material.id} className="question-option-card">
            <div className="support-material-editor__header">
              <div>
                <span className="question-label">
                  {formatMaterialTypeLabel(material.assetType)} {materialIndex + 1}
                </span>
                <p className="support-material-editor__hint">
                  Tipo fixo deste item: {formatMaterialTypeLabel(material.assetType)}.
                </p>
              </div>

              <div className="support-material-editor__actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onMoveSupportMaterial(materialIndex, -1)}
                  disabled={materialIndex === 0}
                >
                  Subir
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onMoveSupportMaterial(materialIndex, 1)}
                  disabled={materialIndex === supportMaterials.length - 1}
                >
                  Descer
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onRemoveSupportMaterial(material.id)}
                >
                  Remover
                </button>
              </div>
            </div>

            <div className="question-form-grid">
              <label className="form-field">
                <span>Posicao</span>
                <select
                  value={material.position}
                  onChange={(event) =>
                    onUpdateSupportMaterial(material.id, "position", event.target.value)
                  }
                >
                  {MATERIAL_POSITION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="text-dark">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Titulo</span>
                <input
                  type="text"
                  value={material.title}
                  onChange={(event) =>
                    onUpdateSupportMaterial(material.id, "title", event.target.value)
                  }
                  placeholder="Ex.: Figura 1, Texto I, Tabela 1"
                />
              </label>

              <label className="form-field form-field--full">
                <span>Legenda</span>
                <textarea
                  value={material.caption}
                  onChange={(event) =>
                    onUpdateSupportMaterial(material.id, "caption", event.target.value)
                  }
                  placeholder="Legenda opcional do material"
                  rows="3"
                />
              </label>

              <label className="form-field form-field--full">
                <span>Fonte</span>
                <input
                  type="text"
                  value={material.sourceLabel}
                  onChange={(event) =>
                    onUpdateSupportMaterial(material.id, "sourceLabel", event.target.value)
                  }
                  placeholder="Texto elaborado para fins educacionais."
                />
              </label>
            </div>

            {material.assetType === "text" ? (
              <label className="form-field form-field--full">
                <span>Conteudo</span>
                <textarea
                  value={material.content}
                  onChange={(event) =>
                    onUpdateSupportMaterial(material.id, "content", event.target.value)
                  }
                  placeholder="Digite o texto de apoio"
                  rows="6"
                  required
                />
              </label>
            ) : null}

            {material.assetType === "table" ? (
              <div className="question-form-grid">
                <label className="form-field">
                  <span>Colunas</span>
                  <textarea
                    value={material.columnsText}
                    onChange={(event) =>
                      onUpdateSupportMaterial(material.id, "columnsText", event.target.value)
                    }
                    placeholder={"Uma coluna por linha\nAluno\nPontos"}
                    rows="5"
                  />
                </label>

                <label className="form-field">
                  <span>Linhas</span>
                  <textarea
                    value={material.rowsText}
                    onChange={(event) =>
                      onUpdateSupportMaterial(material.id, "rowsText", event.target.value)
                    }
                    placeholder={"Uma linha por linha, separando colunas com |\nAna | 14\nBruno | 16"}
                    rows="5"
                  />
                </label>
              </div>
            ) : null}

            {material.assetType === "image" ? (
              <div className="question-form-grid">
                <label className="form-field">
                  <span>Origem da imagem</span>
                  <select
                    value={material.imageSourceType}
                    onChange={(event) =>
                      onUpdateSupportMaterial(material.id, "imageSourceType", event.target.value)
                    }
                  >
                    {IMAGE_SOURCE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="text-dark">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>MIME type</span>
                  <input
                    type="text"
                    value={material.mimeType}
                    onChange={(event) =>
                      onUpdateSupportMaterial(material.id, "mimeType", event.target.value)
                    }
                    placeholder="image/png"
                  />
                </label>

                <label className="form-field form-field--full">
                  <span>Alt text</span>
                  <textarea
                    value={material.altText}
                    onChange={(event) =>
                      onUpdateSupportMaterial(material.id, "altText", event.target.value)
                    }
                    placeholder="Descricao objetiva da imagem"
                    rows="3"
                    required
                  />
                </label>

                <label className="form-field form-field--full">
                  <span>
                    {material.imageSourceType === "public_url"
                      ? "URL publica"
                      : material.imageSourceType === "file_base64"
                        ? "Arquivo em base64"
                        : "Prompt de geracao"}
                  </span>
                  <textarea
                    value={material.imageSourceValue}
                    onChange={(event) =>
                      onUpdateSupportMaterial(material.id, "imageSourceValue", event.target.value)
                    }
                    placeholder={
                      material.imageSourceType === "public_url"
                        ? "https://meu-bucket.s3.amazonaws.com/question-assets/imagem.png"
                        : material.imageSourceType === "file_base64"
                          ? "iVBORw0KGgoAAAANSUhEUgAA..."
                          : "Ilustracao didatica em estilo infografico..."
                    }
                    rows={material.imageSourceType === "public_url" ? "3" : "5"}
                  />
                </label>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    ) : (
      <p className="status-text">
        Nenhum material adicionado. Adicione ao menos um item antes de enviar.
      </p>
    )}
  </div>
);

export default SupportMaterialsEditor;
